import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('Vendedores')
      .select('*')
      .order('Nome', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ vendedores: data });
  } catch (error: any) {
    console.error('API Error (Supabase Vendedores):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
