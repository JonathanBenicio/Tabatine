import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  AvatarFileSchema,
  matchesImageSignature,
} from "@/lib/profile-validation";
import { apiError } from "@/utils/api-error";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user)
      return apiError(authError, "upload-avatar: auth", 401);
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (error: unknown) {
      return apiError(error, "upload-avatar: form", 400);
    }
    const input = AvatarFileSchema.safeParse(formData.get("file"));
    if (!input.success)
      return NextResponse.json(
        { error: input.error.issues[0].message },
        { status: 400 },
      );
    const file = input.data;
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!matchesImageSignature(bytes, file.type)) {
      return NextResponse.json(
        { error: "O conteúdo não corresponde a uma imagem PNG, JPEG ou WebP." },
        { status: 400 },
      );
    }
    const extensions: Record<string, string> = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp",
    };
    const filePath = `${user.id}/${randomUUID()}.${extensions[file.type]}`;
    const storage = supabase.storage.from("avatars");
    const { error: uploadError } = await storage.upload(filePath, bytes, {
      contentType: file.type,
      upsert: false,
    });
    if (uploadError) return apiError(uploadError, "upload-avatar: storage");
    const { data } = storage.getPublicUrl(filePath);
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: data.publicUrl },
    });
    if (updateError) {
      const { error: cleanupError } = await storage.remove([filePath]);
      if (cleanupError)
        console.error("upload-avatar: rollback failed", cleanupError);
      return apiError(updateError, "upload-avatar: metadata");
    }
    revalidatePath("/perfil");
    return NextResponse.json({ publicUrl: data.publicUrl });
  } catch (error: unknown) {
    return apiError(error, "upload-avatar");
  }
}
