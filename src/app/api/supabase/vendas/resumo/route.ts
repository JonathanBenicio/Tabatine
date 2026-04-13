import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { getISOWeek, parseISO, getYear } from 'date-fns';

interface PedidoResumoRow {
  data_inclusao: string | null;
}

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    // [B1] Validação robusta do parâmetro year com bounds check
    const rawYear = searchParams.get('year');
    const year = rawYear ? parseInt(rawYear, 10) : new Date().getFullYear();
    if (isNaN(year) || year < MIN_YEAR || year > MAX_YEAR) {
      return NextResponse.json(
        { error: `Parâmetro year inválido. Deve ser entre ${MIN_YEAR} e ${MAX_YEAR}.` },
        { status: 400 }
      );
    }

    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    // [B2] Query com select distinto apenas da coluna necessária
    // Usamos .limit() como safety net contra volumes excessivos
    const { data, error } = await supabase
      .from('pedidos_venda')
      .select('data_inclusao')
      .gte('data_inclusao', startDate)
      .lte('data_inclusao', endDate)
      .limit(10000);

    if (error) throw error;

    // Processamos no servidor para retornar um array limpo de semanas
    const activeWeeks = new Set<number>();

    // [S1] Tipagem explícita ao invés de any
    (data as PedidoResumoRow[] | null)?.forEach((row: PedidoResumoRow) => {
      if (row.data_inclusao) {
        const date = parseISO(row.data_inclusao);
        // Garantimos que a data pertence ao ano solicitado
        // (vendas no final/inicio de ano podem cair em semanas ISO do ano anterior/proximo)
        if (getYear(date) === year) {
          activeWeeks.add(getISOWeek(date));
        }
      }
    });

    return NextResponse.json({
      year,
      activeWeeks: Array.from(activeWeeks).sort((a, b) => a - b)
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno';
    console.error('API Error (Vendas Resumo):', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
