import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('ContasCorrente')
      .select('*')
      .order('Descricao', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ contas: data });
  } catch (error: any) {
    console.error('API Error (Supabase Contas):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
