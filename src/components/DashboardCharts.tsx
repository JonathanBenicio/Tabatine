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
  const { vendas, fetchVendas, loading, setFilters } = useVendasStore();
  const [isMounted, setIsMounted] = useState(false);

  const now = new Date();
  const [selectedWeek, setSelectedWeek] = useState(getISOWeek(now));
  const [selectedYear, setSelectedYear] = useState(getYear(now));

  const [initialDataSet, setInitialDataSet] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch data when week or year changes
  useEffect(() => {
    if (!isMounted) return;

    const { start, end } = getWeekRange(selectedWeek, selectedYear);
    const startDate = format(start, 'yyyy-MM-dd');
    const endDate = format(end, 'yyyy-MM-dd');

    // Update store filters and fetch
    setFilters({ startDate, endDate });
    fetchVendas(1, true, 1000); // Higher limit for dashboard
  }, [selectedWeek, selectedYear, isMounted, setFilters, fetchVendas]);

  // REMOVED: No longer setting week/year based on most recent sale automatically,
  // as we now prefer the current week + API fetching for that week.

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
    const validVendas = vendas || [];

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

    validVendas.forEach(venda => {
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
    const totalComissaoSemana = validVendas.reduce((acc, v) => {
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
      <div className="space-y-6 animate-pulse">
        {/* Skeleton Top Bar */}
        <div className="h-16 w-full rounded-2xl bg-slate-200/50 dark:bg-zinc-800/50 backdrop-blur-xl"></div>
        {/* Skeleton Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200/50 dark:bg-zinc-800/50 backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-1/2 bg-slate-300/50 dark:bg-zinc-700/50 rounded"></div>
                <div className="h-8 w-8 rounded-lg bg-slate-300/50 dark:bg-zinc-700/50"></div>
              </div>
              <div className="h-6 w-3/4 bg-slate-300/50 dark:bg-zinc-700/50 rounded"></div>
            </div>
          ))}
        </div>
        {/* Skeleton Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[400px] rounded-2xl bg-slate-200/50 dark:bg-zinc-800/50 backdrop-blur-xl"></div>
          <div className="h-[400px] rounded-2xl bg-slate-200/50 dark:bg-zinc-800/50 backdrop-blur-xl"></div>
        </div>
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
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/60 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 p-4 backdrop-blur-xl shadow-lg shadow-teal-900/5 dark:shadow-none">
        <CalendarDays className="w-5 h-5 text-teal-600 dark:text-purple-400" />

        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200/50 dark:border-transparent">
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Semana</label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="bg-white/80 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-teal-500/30 dark:focus:ring-purple-500/30 focus:border-teal-500/50 dark:focus:border-purple-500/50 outline-none backdrop-blur-md"
            >
              {weekOptions.map(w => (
                <option key={w} value={w} className="bg-white dark:bg-zinc-800 text-slate-900 dark:text-white">Semana {w}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Ano</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-white/80 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-teal-500/30 dark:focus:ring-purple-500/30 focus:border-teal-500/50 dark:focus:border-purple-500/50 outline-none backdrop-blur-md"
            >
              {yearOptions.map(y => (
                <option key={y} value={y} className="bg-white dark:bg-zinc-800 text-slate-900 dark:text-white">{y}</option>
              ))}
            </select>
          </div>

          <button onClick={nextWeek} className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200/50 dark:border-transparent">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <span id="week-label" className="text-slate-500 dark:text-zinc-400 text-sm ml-auto">{weekLabel}</span>
      </div>
      
      {/* Cards de Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-white/60 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 p-6 backdrop-blur-xl shadow-lg shadow-teal-900/5 dark:shadow-none transition-all hover:bg-white/70 dark:hover:bg-zinc-800/50 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500 dark:text-zinc-400">Faturamento</h3>
            <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-500/20 transition-colors">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalValorSemana)}</p>
        </div>

        <div className="rounded-2xl border border-white/60 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 p-6 backdrop-blur-xl shadow-lg shadow-teal-900/5 dark:shadow-none transition-all hover:bg-white/70 dark:hover:bg-zinc-800/50 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500 dark:text-zinc-400">Pedidos</h3>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/20 transition-colors">
              <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalVendasSemana}</p>
        </div>

        <div className="rounded-2xl border border-white/60 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 p-6 backdrop-blur-xl shadow-lg shadow-teal-900/5 dark:shadow-none transition-all hover:bg-white/70 dark:hover:bg-zinc-800/50 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500 dark:text-zinc-400">Ticket Médio</h3>
            <div className="p-2 bg-purple-100 dark:bg-purple-500/10 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-500/20 transition-colors">
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(ticketMedio)}</p>
        </div>

        <div className="rounded-2xl border border-white/60 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 p-6 backdrop-blur-xl shadow-lg shadow-teal-900/5 dark:shadow-none transition-all hover:bg-white/70 dark:hover:bg-zinc-800/50 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500 dark:text-zinc-400">Melhor Dia</h3>
            <div className="p-2 bg-orange-100 dark:bg-orange-500/10 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-500/20 transition-colors">
              <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{bestDay.valor > 0 ? bestDay.name : '--'}</p>
          {bestDay.valor > 0 && <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">{formatCurrency(bestDay.valor)}</p>}
        </div>

        <div className="rounded-2xl border border-white/60 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 p-6 backdrop-blur-xl shadow-lg shadow-teal-900/5 dark:shadow-none transition-all hover:bg-white/70 dark:hover:bg-zinc-800/50 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500 dark:text-zinc-400">Comissão</h3>
            <div className="p-2 bg-pink-100 dark:bg-pink-500/10 rounded-lg group-hover:bg-pink-200 dark:group-hover:bg-pink-500/20 transition-colors">
              <TrendingUp className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalComissaoSemana)}</p>
        </div>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Faturamento por Dia (Segunda → Domingo) */}
        <div className="lg:col-span-2 rounded-2xl border border-white/60 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 p-6 backdrop-blur-xl shadow-lg shadow-teal-900/5 dark:shadow-none">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">Faturamento por Dia</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-500 mb-6">Segunda a Domingo — {weekLabel}</p>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartFaturamentoDia} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f766e" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.8}/>
                  </linearGradient>
                  <linearGradient id="barGradientDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$ ${(val/1000).toFixed(0)}k`} />
                <Tooltip 
                  cursor={{ fill: 'var(--foreground)', opacity: 0.05 }}
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)', borderRadius: '12px', color: 'var(--foreground)', backdropFilter: 'blur(12px)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                  formatter={(value: any) => [formatCurrency(Number(value ?? 0)), 'Faturamento']}
                />
                <Bar dataKey="valor" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={48} className="dark:hidden" />
                <Bar dataKey="valor" fill="url(#barGradientDark)" radius={[6, 6, 0, 0]} maxBarSize={48} className="hidden dark:block" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Pizza (Status) */}
        <div className="rounded-2xl border border-white/60 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 p-6 backdrop-blur-xl shadow-lg shadow-teal-900/5 dark:shadow-none">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">Pedidos por Status</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-500 mb-6">Distribuição por quantidade — {weekLabel}</p>
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
                  label={({ percent }) => percent ? `${(percent * 100).toFixed(0)}%` : ''}
                >
                  {chartStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)', borderRadius: '12px', color: 'var(--foreground)', backdropFilter: 'blur(12px)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                  formatter={(value: any, name: any) => {
                    const total = chartStatus.reduce((acc, curr) => acc + curr.value, 0);
                    const valNum = Number(value || 0);
                    const percent = total > 0 ? ((valNum / total) * 100).toFixed(1) : '0';
                    return [`${valNum} ${valNum === 1 ? 'pedido' : 'pedidos'} (${percent}%)`, String(name || '')];
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gráfico Secundário — Quantidade de Pedidos por Dia */}
      <div className="rounded-2xl border border-white/60 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 p-6 backdrop-blur-xl shadow-lg shadow-teal-900/5 dark:shadow-none">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">Quantidade de Pedidos por Dia</h3>
        <p className="text-xs text-slate-500 dark:text-zinc-500 mb-6">Volume diário — {weekLabel}</p>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartQtdDia} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorQtd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)', borderRadius: '12px', color: 'var(--foreground)', backdropFilter: 'blur(12px)' }}
                itemStyle={{ color: 'var(--foreground)' }}
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
        <div className="rounded-2xl border border-white/60 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 p-6 backdrop-blur-xl shadow-lg shadow-teal-900/5 dark:shadow-none transition-all hover:bg-white/70 dark:hover:bg-zinc-800/20">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">Top Vendedores</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-500 mb-6">Maiores faturamentos — {weekLabel}</p>
          
          <div className="space-y-6">
            {topVendedores.map((vend, idx) => (
              <div key={vend.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 dark:text-zinc-300 font-medium flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-[10px] text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                      {idx + 1}
                    </span>
                    {vend.name}
                  </span>
                  <span className="text-slate-900 dark:text-white font-semibold">{formatCurrency(vend.total)}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-teal-400 dark:from-blue-600 dark:to-blue-400 rounded-full"
                    style={{ width: `${(vend.total / (topVendedores[0]?.total || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {topVendedores.length === 0 && (
              <p className="text-center text-slate-500 dark:text-zinc-500 py-8 italic">Sem faturamentos nesta semana.</p>
            )}
          </div>
        </div>

        {/* Top Produtos */}
        <div className="rounded-2xl border border-white/60 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 p-6 backdrop-blur-xl shadow-lg shadow-teal-900/5 dark:shadow-none transition-all hover:bg-white/70 dark:hover:bg-zinc-800/20">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">Top Produtos</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-500 mb-6">Produtos mais rentáveis — {weekLabel}</p>
          
          <div className="space-y-4">
            {topProdutos.map((prod, idx) => (
              <div key={prod.name} className="flex items-center gap-4 p-3 rounded-xl bg-white/60 dark:bg-zinc-800/30 border border-white/80 dark:border-zinc-700/30 hover:bg-white dark:hover:bg-zinc-800/50 shadow-sm dark:shadow-none transition-colors group">
                 <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-500/20 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/20 transition-colors">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{prod.name}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-500">{formatCurrency(prod.total)}</p>
                  </div>
                  <TrendingUp className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
            {topProdutos.length === 0 && (
              <p className="text-center text-slate-500 dark:text-zinc-500 py-8 italic">Dados de produtos indisponíveis.</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
