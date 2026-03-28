'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useVendasStore } from '@/store/useVendasStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { parseISO, isValid, startOfWeek, endOfWeek, isWithinInterval, format, setWeek, setYear, getISOWeek, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, DollarSign, ShoppingCart, Activity, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const STATUS_COLORS: Record<string, string> = {
  'Faturado': '#10b981',
  'Pendente': '#f59e0b',
  'Cancelado': '#ef4444',
  'PAGO': '#10b981',
  'PENDENTE': '#f59e0b',
  'CANCELADA': '#ef4444'
};

function parseDateString(dateStr: string): Date | null {
  if (!dateStr || dateStr === '--') return null;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    return isValid(d) ? d : null;
  }
  const d = parseISO(dateStr);
  return isValid(d) ? d : null;
}

function getWeekRange(week: number, year: number) {
  // Build a date from week + year, then get the start/end of that week
  const baseDate = setWeek(setYear(new Date(), year), week, { weekStartsOn: 1 });
  const start = startOfWeek(baseDate, { weekStartsOn: 1 });
  const end = endOfWeek(baseDate, { weekStartsOn: 1 });
  return { start, end };
}

export default function DashboardCharts() {
  const { vendas, fetchVendas, loading } = useVendasStore();
  const [isMounted, setIsMounted] = useState(false);

  const now = new Date();
  const [selectedWeek, setSelectedWeek] = useState(getISOWeek(now));
  const [selectedYear, setSelectedYear] = useState(getYear(now));

  const [initialDataSet, setInitialDataSet] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Dispara apenas quando montar (o `hasFetchedInitial` lá no zustand vai bloquear dupes)
    if (vendas.length === 0) {
      fetchVendas(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once data arrives, set the default week/year to the most recent sale
  useEffect(() => {
    if (vendas.length > 0 && !initialDataSet) {
      let latestDate: Date | null = null;
      vendas.forEach(v => {
        const d = parseDateString(v.data);
        if (d && (!latestDate || d > latestDate)) {
          latestDate = d;
        }
      });
      if (latestDate) {
        setSelectedYear(getYear(latestDate));
        setSelectedWeek(getISOWeek(latestDate));
      }
      setInitialDataSet(true);
    }
  }, [vendas, initialDataSet]);

  // Generate year options combining current year and any years from data
  const yearOptions = useMemo(() => {
    const current = getYear(new Date());
    const years = new Set<number>([current, current - 1, current + 1]);
    vendas.forEach(v => {
      const d = parseDateString(v.data);
      if (d) years.add(getYear(d));
    });
    return Array.from(years).sort((a, b) => a - b);
  }, [vendas]);

  // Generate week options (1–52)
  const weekOptions = useMemo(() => Array.from({ length: 52 }, (_, i) => i + 1), []);

  const prevWeek = () => {
    if (selectedWeek <= 1) {
      setSelectedWeek(52);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedWeek(w => w - 1);
    }
  };

  const nextWeek = () => {
    if (selectedWeek >= 52) {
      setSelectedWeek(1);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedWeek(w => w + 1);
    }
  };

  const aggregatedData = useMemo(() => {
    if (!vendas || vendas.length === 0) return null;

    const { start: weekStart, end: weekEnd } = getWeekRange(selectedWeek, selectedYear);

    const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const jsToIdx = [6, 0, 1, 2, 3, 4, 5];

    const faturamentoPorDia: number[] = new Array(7).fill(0);
    const qtdPorDia: number[] = new Array(7).fill(0);

    let totalValorSemana = 0;
    let totalVendasSemana = 0;
    const statusVendas: Record<string, number> = {};
    const vendedoresAgg: Record<string, number> = {};
    const produtosAgg: Record<string, number> = {};

    vendas.forEach(venda => {
      const dateObj = parseDateString(venda.data);
      if (!dateObj) return;

      if (!isWithinInterval(dateObj, { start: weekStart, end: weekEnd })) return;

      const valor = venda.valorTotal;
      totalValorSemana += valor;
      totalVendasSemana++;

      const dayIdx = jsToIdx[dateObj.getDay()];
      faturamentoPorDia[dayIdx] += valor;
      qtdPorDia[dayIdx] += 1;

      const status = venda.vencimentoStatus || 'Pendente';
      statusVendas[status] = (statusVendas[status] || 0) + 1;

      // Top Vendedores Aggregation
      const vendKey = venda.vendedor || 'Sem Vendedor';
      vendedoresAgg[vendKey] = (vendedoresAgg[vendKey] || 0) + valor;

      // Top Produtos Aggregation
      const prodKey = venda.produto || 'Sem Nome';
      produtosAgg[prodKey] = (produtosAgg[prodKey] || 0) + valor;
    });

    const ticketMedio = totalVendasSemana > 0 ? totalValorSemana / totalVendasSemana : 0;
    
    // Total Commissions projection (heuristic)
    const totalComissaoSemana = vendas.reduce((acc, v) => {
      const d = parseDateString(v.data);
      if (d && isWithinInterval(d, { start: weekStart, end: weekEnd })) {
        return acc + (v.valorTotal * (v.percComissao / 100));
      }
      return acc;
    }, 0);

    const topVendedores = Object.entries(vendedoresAgg)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, total]) => ({ name, total }));

    const topProdutos = Object.entries(produtosAgg)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, total]) => ({ name, total }));

    const chartFaturamentoDia = daysOfWeek.map((day, i) => ({
      name: day,
      valor: faturamentoPorDia[i],
      qtd: qtdPorDia[i],
    }));

    const chartStatus = Object.entries(statusVendas).map(([name, value]) => ({ name, value }));

    const chartQtdDia = daysOfWeek.map((day, i) => ({
      name: day,
      qtd: qtdPorDia[i],
    }));

    const weekLabel = `${format(weekStart, "dd/MM", { locale: ptBR })} – ${format(weekEnd, "dd/MM", { locale: ptBR })}`;

    return {
      totalValorSemana,
      totalVendasSemana,
      ticketMedio,
      chartFaturamentoDia,
      chartStatus,
      chartQtdDia,
      topVendedores,
      topProdutos,
      totalComissaoSemana,
      weekLabel,
    };
  }, [vendas, selectedWeek, selectedYear]);

  if (!isMounted) return null;

  if (loading && (!vendas || vendas.length === 0)) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-zinc-400">Carregando dados do dashboard...</p>
        </div>
      </div>
    );
  }

  if (!aggregatedData) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50">
        <p className="text-zinc-500">Nenhum dado de venda encontrado para a semana selecionada.</p>
      </div>
    );
  }

  const { 
    totalValorSemana, 
    ticketMedio, 
    totalVendasSemana, 
    totalComissaoSemana,
    chartFaturamentoDia, 
    chartStatus, 
    chartQtdDia, 
    topVendedores,
    topProdutos,
    weekLabel 
  } = aggregatedData;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const bestDay = chartFaturamentoDia.reduce((a, b) => (b.valor > a.valor ? b : a), chartFaturamentoDia[0]);

  return (
    <div className="space-y-6">

      {/* Week + Year Selector */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-4 backdrop-blur-xl">
        <CalendarDays className="w-5 h-5 text-purple-400" />

        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-500 uppercase tracking-wider">Semana</label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 outline-none"
            >
              {weekOptions.map(w => (
                <option key={w} value={w}>Semana {w}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-500 uppercase tracking-wider">Ano</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 outline-none"
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button onClick={nextWeek} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <span className="text-zinc-400 text-sm ml-auto">{weekLabel}</span>
      </div>
      
      {/* Cards de Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl transition-all hover:bg-zinc-800/50 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-400">Faturamento</h3>
            <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalValorSemana)}</p>
        </div>

        <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl transition-all hover:bg-zinc-800/50 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-400">Pedidos</h3>
            <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{totalVendasSemana}</p>
        </div>

        <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl transition-all hover:bg-zinc-800/50 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-400">Ticket Médio</h3>
            <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(ticketMedio)}</p>
        </div>

        <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl transition-all hover:bg-zinc-800/50 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-400">Melhor Dia</h3>
            <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{bestDay.valor > 0 ? bestDay.name : '--'}</p>
          {bestDay.valor > 0 && <p className="text-xs text-zinc-500 mt-1">{formatCurrency(bestDay.valor)}</p>}
        </div>

        <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl transition-all hover:bg-zinc-800/50 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-400">Comissão</h3>
            <div className="p-2 bg-pink-500/10 rounded-lg group-hover:bg-pink-500/20 transition-colors">
              <TrendingUp className="w-5 h-5 text-pink-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalComissaoSemana)}</p>
        </div>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Faturamento por Dia (Segunda → Domingo) */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white mb-1">Faturamento por Dia</h3>
          <p className="text-xs text-zinc-500 mb-6">Segunda a Domingo — {weekLabel}</p>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartFaturamentoDia} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$ ${(val/1000).toFixed(0)}k`} />
                <Tooltip 
                  cursor={{ fill: '#27272a', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#e4e4e7' }}
                  formatter={(value: any) => [formatCurrency(Number(value ?? 0)), 'Faturamento']}
                />
                <Bar dataKey="valor" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Pizza (Status) */}
        <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white mb-1">Pedidos por Status</h3>
          <p className="text-xs text-zinc-500 mb-6">Distribuição Financeira — {weekLabel}</p>
          <div className="h-[300px] w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gráfico Secundário — Quantidade de Pedidos por Dia */}
      <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-1">Quantidade de Pedidos por Dia</h3>
        <p className="text-xs text-zinc-500 mb-6">Volume diário — {weekLabel}</p>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartQtdDia} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorQtd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#e4e4e7' }}
                formatter={(value: any) => [value ?? 0, 'Pedidos']}
              />
              <Area type="monotone" dataKey="qtd" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorQtd)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rankings Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Vendedores */}
        <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl transition-all hover:bg-zinc-800/20">
          <h3 className="text-lg font-semibold text-white mb-1">Top Vendedores</h3>
          <p className="text-xs text-zinc-500 mb-6">Maiores faturamentos — {weekLabel}</p>
          
          <div className="space-y-6">
            {topVendedores.map((vend, idx) => (
              <div key={vend.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300 font-medium flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-[10px] text-blue-400 border border-blue-500/20">
                      {idx + 1}
                    </span>
                    {vend.name}
                  </span>
                  <span className="text-white font-semibold">{formatCurrency(vend.total)}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                    style={{ width: `${(vend.total / (topVendedores[0]?.total || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {topVendedores.length === 0 && (
              <p className="text-center text-zinc-500 py-8 italic">Sem faturamentos nesta semana.</p>
            )}
          </div>
        </div>

        {/* Top Produtos */}
        <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl transition-all hover:bg-zinc-800/20">
          <h3 className="text-lg font-semibold text-white mb-1">Top Produtos</h3>
          <p className="text-xs text-zinc-500 mb-6">Produtos mais rentáveis — {weekLabel}</p>
          
          <div className="space-y-4">
            {topProdutos.map((prod, idx) => (
              <div key={prod.name} className="flex items-center gap-4 p-3 rounded-xl bg-zinc-800/30 border border-zinc-700/30 hover:bg-zinc-800/50 transition-colors group">
                 <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{prod.name}</p>
                    <p className="text-xs text-zinc-500">{formatCurrency(prod.total)}</p>
                  </div>
                  <TrendingUp className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
            {topProdutos.length === 0 && (
              <p className="text-center text-zinc-500 py-8 italic">Dados de produtos indisponíveis.</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
