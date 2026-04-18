import crypto from 'crypto';

/**
 * Valida a assinatura HMAC-SHA256 de um webhook recebido da Omie.
 *
 * Utiliza `crypto.timingSafeEqual` para comparação segura contra timing attacks.
 * A assinatura esperada deve estar no formato `sha256=<hex>`.
 *
 * @param payload - O corpo bruto da requisição como string
 * @param signature - O valor do header `X-Omie-Signature`
 * @param secret - O secret compartilhado configurado na Omie (OMIE_WEBHOOK_SECRET)
 * @returns `true` se a assinatura é válida, `false` caso contrário
 *
 * @example
 * const rawBody = await request.text();
 * const signature = request.headers.get('X-Omie-Signature');
 * const secret = process.env.OMIE_WEBHOOK_SECRET!;
 *
 * if (!validateOmieWebhookSignature(rawBody, signature, secret)) {
 *   return new Response('Unauthorized', { status: 401 });
 * }
 */
export function validateOmieWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;

  const expectedHex = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');

  const expected = `sha256=${expectedHex}`;

  // Buffers devem ter o mesmo tamanho para timingSafeEqual funcionar
  if (signature.length !== expected.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'utf8'),
    Buffer.from(expected, 'utf8')
  );
}
