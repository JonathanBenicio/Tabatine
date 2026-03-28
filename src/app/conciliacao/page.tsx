"use client";

import React, { useState, useMemo } from "react";
import { useOfxStore } from "@/store/useOfxStore";
import { Trash2 } from "lucide-react";
import { OfxTransaction } from "@/lib/ofxParser";
import { formatBRL } from "@/utils/format";

// Sub-components
import { UploadZone } from "./_components/UploadZone";
import { SummaryCards } from "./_components/SummaryCards";
import { CategoryFilters } from "./_components/CategoryFilters";
import { TransactionsTable } from "./_components/TransactionsTable";
import { TransactionDetailModal } from "./_components/TransactionDetailModal";
import { LoadingOverlay } from "./_components/LoadingOverlay";

export default function ConciliacaoPage() {
  const { data, loading, clearData, importFile } = useOfxStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<OfxTransaction | null>(null);
  const itemsPerPage = 15;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importFile(file);
      setCurrentPage(1);
      setSelectedCategory(null);
    }
  };

  const categories = useMemo(() =>
    Array.from(new Set(data?.transactions.map(t => t.category) || [])),
    [data?.transactions]
  );

  const filteredTransactions = useMemo(() =>
    selectedCategory
      ? data?.transactions.filter(t => t.category === selectedCategory) || []
      : data?.transactions || [],
    [data?.transactions, selectedCategory]
  );

  const paginatedTransactions = useMemo(() =>
    filteredTransactions.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ),
    [filteredTransactions, currentPage, itemsPerPage]
  );

  const totalPaginas = useMemo(() =>
    Math.ceil(filteredTransactions.length / itemsPerPage),
    [filteredTransactions.length, itemsPerPage]
  );

  const income = useMemo(() =>
    data?.transactions
      .filter(t => t.type === 'CREDIT')
      .reduce((acc, t) => acc + t.amount, 0) || 0,
    [data?.transactions]
  );

  const expenses = useMemo(() =>
    data?.transactions
      .filter(t => t.type === 'DEBIT')
      .reduce((acc, t) => acc + t.amount, 0) || 0,
    [data?.transactions]
  );

  const balance = useMemo(() => income - expenses, [income, expenses]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent tracking-tighter">
            Análise de Extrato
          </h1>
          <p className="text-zinc-500 mt-1 font-medium">Extração completa de dados e metadados bancários.</p>
        </div>

        {data && (
          <button 
            onClick={clearData}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition-all active:scale-95 font-bold text-xs uppercase tracking-widest"
          >
            <Trash2 size={14} />
            Limpar Tudo
          </button>
        )}
      </div>

      {!data ? (
        <UploadZone onFileUpload={handleFileUpload} />
      ) : (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          <SummaryCards
            income={income}
            expenses={expenses}
            balance={balance}
          />

          <CategoryFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => { setSelectedCategory(cat); setCurrentPage(1); }}
          />

          <TransactionsTable
            transactions={paginatedTransactions}
            currentPage={currentPage}
            totalPaginas={totalPaginas}
            onPageChange={setCurrentPage}
            onViewTransaction={setViewingTransaction}
          />
        </div>
      )}

      {viewingTransaction && (
        <TransactionDetailModal
          transaction={viewingTransaction}
          onClose={() => setViewingTransaction(null)}
        />
      )}

      {loading && <LoadingOverlay />}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
