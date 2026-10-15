import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import { currency } from '../utils/currency.js';
import { getImageUrl } from '../utils/imageUrl.js';
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiFilter,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiList,
  FiImage,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiRefreshCw,
} from 'react-icons/fi';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';

const initialFilters = {
  type: 'all',
  category: 'all',
  startDate: '',
  endDate: '',
  search: '',
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.categories || []);
    } catch {
      /* silent */
    }
  };

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filters.type !== 'all') params.type = filters.type;
      if (filters.category !== 'all') params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.search) params.search = filters.search;

      const { data } = await api.get('/transactions', { params });
      setTransactions(data.transactions || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      toast.error(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchTransactions, filters.search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchTransactions]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/transactions/${deleteTarget._id}`);
      toast.success('Transaction deleted');
      setDeleteTarget(null);
      fetchTransactions();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setPage(1);
  };

  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.category !== 'all' ||
    filters.startDate ||
    filters.endDate ||
    filters.search;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Search Bar */}
      <div className="card !p-4 sm:!p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Quick Search */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={17} />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by title or notes..."
              className="input input-icon-both text-sm"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => handleFilterChange('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <FiX size={15} />
              </button>
            )}
          </div>

          {/* Quick Type Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0">
            {[
              { id: 'all', label: 'All' },
              { id: 'income', label: 'Income' },
              { id: 'expense', label: 'Expenses' },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleFilterChange('type', id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filters.type === id
                    ? id === 'income'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : id === 'expense'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              className={`btn-secondary text-xs sm:text-sm !py-2 ${
                hasActiveFilters
                  ? 'border-blue-400 bg-blue-50/50 text-blue-700'
                  : ''
              }`}
              onClick={() => setShowFilters((s) => !s)}
            >
              <FiFilter size={16} />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-blue-600 ml-0.5" />
              )}
            </button>

            <button
              type="button"
              className="btn-primary text-xs sm:text-sm !py-2"
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              <FiPlus size={18} className="stroke-[2.5]" />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>

        {/* Detailed Filters Expandable Drawer */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Advanced Filter Options
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
                >
                  <FiRefreshCw size={12} /> Reset Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="input text-xs"
                >
                  <option value="all">All Categories</option>
                  {categories
                    .filter((c) => (filters.type === 'all' ? true : c.type === filters.type))
                    .map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="label">From Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="label">To Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="input text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transactions List Table / Card */}
      <div className="card !p-0 overflow-hidden shadow-sm">
        {/* Table summary bar */}
        <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            {pagination.total} Total Transaction{pagination.total !== 1 ? 's' : ''}
          </p>
          <span className="text-xs text-slate-600 font-medium">
            Page {pagination.page} of {Math.max(pagination.pages, 1)}
          </span>
        </div>

        {loading ? (
          <Loader text="Fetching transactions..." />
        ) : transactions.length === 0 ? (
          <div className="py-8">
            <EmptyState
              icon={FiList}
              title="No transactions found"
              description={
                hasActiveFilters
                  ? 'No transactions match your current search and filter criteria.'
                  : 'Get started by logging your very first income or expense.'
              }
              action={
                hasActiveFilters ? (
                  <button onClick={resetFilters} className="btn-secondary text-xs">
                    Clear Filters
                  </button>
                ) : (
                  <button
                    className="btn-primary text-xs"
                    onClick={() => {
                      setEditing(null);
                      setModalOpen(true);
                    }}
                  >
                    <FiPlus /> Add Transaction
                  </button>
                )
              }
            />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/50 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Details</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5 text-right">Amount</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <tr
                      key={tx._id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                              tx.type === 'income'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                : 'bg-rose-50 text-rose-600 border border-rose-100'
                            }`}
                          >
                            {tx.type === 'income' ? (
                              <FiTrendingUp size={18} className="stroke-[2.5]" />
                            ) : (
                              <FiTrendingDown size={18} className="stroke-[2.5]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition">
                              {tx.title}
                            </p>
                            {tx.description && (
                              <p className="text-xs text-slate-600 truncate max-w-xs mt-0.5">
                                {tx.description}
                              </p>
                            )}
                          </div>
                          {tx.receiptImage && (
                            <button
                              type="button"
                              onClick={() => setPreviewImage(tx.receiptImage)}
                              className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition shrink-0"
                              title="View receipt"
                            >
                              <FiImage size={15} />
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="badge-slate font-semibold text-xs">
                          {tx.category}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-slate-600">
                        {new Date(tx.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span
                          className={`font-extrabold text-sm ${
                            tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'}
                          {currency(tx.amount)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(tx);
                              setModalOpen(true);
                            }}
                            className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition active:scale-95"
                            title="Edit Transaction"
                          >
                            <FiEdit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(tx)}
                            className="p-2 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition active:scale-95"
                            title="Delete Transaction"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-slate-100">
              {transactions.map((tx) => (
                <div key={tx._id} className="p-4 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className={`w-10 h-30 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
                          tx.type === 'income'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}
                      >
                        {tx.type === 'income' ? (
                          <FiTrendingUp size={18} className="stroke-[2.5]" />
                        ) : (
                          <FiTrendingDown size={18} className="stroke-[2.5]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate">{tx.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
                          <span className="badge-slate text-[11px] font-semibold">{tx.category}</span>
                          <span className="text-slate-600">
                            {new Date(tx.date).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        {tx.description && (
                          <p className="text-xs text-slate-600 mt-1 line-clamp-1">{tx.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={`font-extrabold text-sm ${
                          tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {currency(tx.amount)}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-2">
                        {tx.receiptImage && (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(tx.receiptImage)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                            title="Receipt"
                          >
                            <FiImage size={15} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(tx);
                            setModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                          title="Edit"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(tx)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs font-semibold text-slate-600">
                  Showing page {pagination.page} of {pagination.pages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn-secondary !py-1.5 !px-3 text-xs"
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                  >
                    <FiChevronLeft size={16} /> Prev
                  </button>
                  <button
                    type="button"
                    className="btn-secondary !py-1.5 !px-3 text-xs"
                    onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
                    disabled={page === pagination.pages}
                  >
                    Next <FiChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add / Edit Transaction Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit Transaction' : 'Create New Transaction'}
        size="100%"
      >
        <TransactionForm
          transaction={editing}
          onSuccess={() => {
            setModalOpen(false);
            setEditing(null);
            fetchTransactions();
          }}
          onCancel={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        loading={deleting}
      />

      {/* Receipt Image Lightbox Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewImage('')}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-2xl p-2 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage('')}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full transition shadow-md"
            >
              <FiX size={18} />
            </button>
            <img
              src={getImageUrl(previewImage)}
              alt="Receipt preview"
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;