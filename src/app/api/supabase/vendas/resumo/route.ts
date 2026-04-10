import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { getISOWeek, parseISO, getYear } from 'date-fns';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    // Buscamos apenas as datas para minimizar o payload
    // Filtramos pelo ano no banco para performance
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const { data, error } = await supabase
      .from('pedidos_venda')
      .select('data_inclusao')
      .gte('data_inclusao', startDate)
      .lte('data_inclusao', endDate);

    if (error) throw error;

    // Processamos no servidor para retornar um array limpo de semanas
    const activeWeeks = new Set<number>();
    
    data?.forEach((row: any) => {
      if (row.data_inclusao) {
        const date = parseISO(row.data_inclusao);
        // Garantimos que a data pertence ao ano solicitado (vendas no final/inicio de ano podem cair em semanas ISO do ano anterior/proximo)
        if (getYear(date) === year) {
          activeWeeks.add(getISOWeek(date));
        }
      }
    });

    return NextResponse.json({
      year,
      activeWeeks: Array.from(activeWeeks).sort((a, b) => a - b)
    });
  } catch (error: any) {
    console.error('API Error (Vendas Resumo):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
