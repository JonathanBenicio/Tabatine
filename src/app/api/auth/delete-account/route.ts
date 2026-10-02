import { NextResponse } from "next/server";
import { DeleteAccountSchema } from "@/lib/profile-validation";
import { apiError } from "@/utils/api-error";
import { createAdminClient, createClient } from "@/utils/supabase/server";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user)
      return apiError(authError, "delete-account: auth", 401);
    const input = DeleteAccountSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!input.success)
      return NextResponse.json(
        { error: "Digite EXCLUIR para confirmar." },
        { status: 400 },
      );
    const admin = await createAdminClient();
    const storage = admin.storage.from("avatars");
    // Auth cannot delete users that still own Storage objects.
    while (true) {
      const { data: files, error } = await storage.list(user.id, {
        limit: 100,
      });
      if (error) {
        if (error.message.toLowerCase().includes("bucket not found")) break;
        return apiError(error, "delete-account: avatar listing");
      }
      const paths = (files ?? [])
        .filter((file) => file.id)
        .map((file) => `${user.id}/${file.name}`);
      if (paths.length === 0) break;
      const { error: removalError } = await storage.remove(paths);
      if (removalError)
        return apiError(removalError, "delete-account: avatar removal");
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return apiError(null, "delete-account: session", 401);
    const { error: revokeError } = await admin.auth.admin.signOut(
      session.access_token,
      "global",
    );
    if (revokeError) return apiError(revokeError, "delete-account: sessions");
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) return apiError(deleteError, "delete-account: delete");
    await supabase.auth.signOut({ scope: "local" });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return apiError(error, "delete-account");
  }
}
