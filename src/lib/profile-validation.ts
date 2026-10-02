import { z } from "zod";

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
export const ProfileNameSchema = z.object({
  fullName: z
    .string({ error: "Informe um nome válido." })
    .trim()
    .min(1, "Informe seu nome.")
    .max(100, "Use até 100 caracteres."),
});
export const ProfilePasswordSchema = z
  .object({
    password: z
      .string({ error: "Informe uma senha válida." })
      .min(8, "A senha precisa ter pelo menos 8 caracteres.")
      .max(128, "Use até 128 caracteres."),
    confirmPassword: z.string({ error: "Confirme sua senha." }),
  })
  .refine((value): boolean => value.password === value.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });
export const DeleteAccountSchema = z.object({
  confirmation: z.literal("EXCLUIR"),
});
export const AvatarFileSchema = z
  .instanceof(File, { error: "Envie uma imagem PNG, JPEG ou WebP." })
  .refine(
    (file: File): boolean => file.size > 0 && file.size <= MAX_AVATAR_BYTES,
    "A imagem deve ter até 2 MB.",
  )
  .refine(
    (file: File): boolean =>
      ["image/png", "image/jpeg", "image/webp"].includes(file.type),
    "Use uma imagem PNG, JPEG ou WebP.",
  );

export function matchesImageSignature(
  bytes: Uint8Array,
  mimeType: string,
): boolean {
  if (mimeType === "image/png") {
    return (
      bytes.length >= 8 &&
      [137, 80, 78, 71, 13, 10, 26, 10].every(
        (value: number, index: number): boolean => bytes[index] === value,
      )
    );
  }
  if (mimeType === "image/jpeg")
    return (
      bytes.length >= 3 &&
      bytes[0] === 255 &&
      bytes[1] === 216 &&
      bytes[2] === 255
    );
  if (mimeType === "image/webp") {
    return (
      bytes.length >= 12 &&
      new TextDecoder().decode(bytes.subarray(0, 4)) === "RIFF" &&
      new TextDecoder().decode(bytes.subarray(8, 12)) === "WEBP"
    );
  }
  return false;
}
