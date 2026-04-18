import { NextResponse } from 'next/server';

/**
 * Retorna uma resposta de erro HTTP segura para o cliente.
 *
 * Loga o erro real no servidor (visível apenas nos logs internos)
 * e retorna uma mensagem genérica ao cliente, evitando a exposição
 * de detalhes internos como nomes de tabelas, colunas ou stack traces.
 *
 * @param error - O erro capturado no bloco catch
 * @param context - Contexto descritivo para o log interno (ex: 'GET /api/supabase/clientes')
 * @param status - HTTP status code (padrão: 500)
 * @returns NextResponse com mensagem de erro genérica
 *
 * @example
 * // Antes (inseguro):
 * } catch (error: any) {
 *   return NextResponse.json({ error: error.message }, { status: 500 });
 * }
 *
 * // Depois (seguro):
 * } catch (error) {
 *   return apiError(error, 'GET /api/supabase/clientes');
 * }
 */
export function apiError(
  error: unknown,
  context: string,
  status: number = 500
): NextResponse {
  // Log interno completo — visível apenas nos logs do servidor (Vercel, etc.)
  console.error(`[API Error] ${context}:`, error);

  // Mapeamento de mensagens genéricas e seguras por status code
  const safeMessages: Record<number, string> = {
    400: 'Requisição inválida. Verifique os parâmetros enviados.',
    401: 'Não autorizado. Faça login para continuar.',
    403: 'Acesso negado. Você não tem permissão para esta ação.',
    404: 'Recurso não encontrado.',
    409: 'Conflito. O recurso já existe ou está em uso.',
  };

  const message =
    safeMessages[status] ??
    'Ocorreu um erro interno. Por favor, tente novamente mais tarde.';

  return NextResponse.json({ error: message }, { status });
}
