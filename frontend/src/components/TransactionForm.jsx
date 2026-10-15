import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUrl.js';
import {
  FiUpload,
  FiX,
  FiCalendar,
  FiTag,
  FiFileText,
  FiTrendingUp,
  FiTrendingDown,
  FiCheck,
} from 'react-icons/fi';

const initialState = {
  title: '',
  amount: '',
  type: 'expense',
  category: '',
  date: new Date().toISOString().split('T')[0],
  description: '',
};

const TransactionForm = ({ transaction, onSuccess, onCancel }) => {
  const [form, setForm] = useState(initialState);
  const [categories, setCategories] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data.categories || []);
      } catch {
        toast.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (transaction) {
      setForm({
        title: transaction.title || '',
        amount: transaction.amount || '',
        type: transaction.type || 'expense',
        category: transaction.category || '',
        date: transaction.date
          ? new Date(transaction.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        description: transaction.description || '',
      });
      if (transaction.receiptImage) setPreview(transaction.receiptImage);
    } else {
      setForm(initialState);
      setPreview('');
    }
  }, [transaction]);

  const filteredCategories = categories.filter((c) => c.type === form.type);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'type') {
      setForm((prev) => ({ ...prev, category: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }
    setReceipt(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter a valid amount');
    if (!form.category) return toast.error('Please select a category');

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => fd.append(key, val));
      if (receipt) fd.append('receiptImage', receipt);

      if (transaction) {
        await api.put(`/transactions/${transaction._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Transaction updated successfully');
      } else {
        await api.post('/transactions', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Transaction added successfully');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Type toggle segmented pill */}
      <div>
        <label className="label">Transaction Type</label>
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setForm({ ...form, type: 'expense', category: '' })}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${
              form.type === 'expense'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 scale-[1.01]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <FiTrendingDown size={17} />
            <span>Expense</span>
          </button>

          <button
            type="button"
            onClick={() => setForm({ ...form, type: 'income', category: '' })}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${
              form.type === 'income'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-[1.01]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <FiTrendingUp size={17} />
            <span>Income</span>
          </button>
        </div>
      </div>

      {/* Title & Amount */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Transaction Title *</label>
          <div className="relative">
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., Grocery Store, Salary"
              className="input"
              maxLength={100}
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Amount (₹) *</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">
              ₹
            </span>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              className="input input-currency-left font-semibold"
              required
            />
          </div>
        </div>
      </div>

      {/* Category & Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Category *</label>
          <div className="relative">
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="input bg-white cursor-pointer"
              required
            >
              <option value="">Select a category</option>
              {filteredCategories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Date *</label>
          <div className="relative">
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className="input cursor-pointer"
              required
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="label">Notes / Description (Optional)</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={2}
          placeholder="Add additional details or remarks..."
          className="input resize-none text-sm"
          maxLength={500}
        />
      </div>

      {/* Receipt Image */}
      <div>
        <label className="label">Receipt or Invoice Image (Optional)</label>
        {preview ? (
          <div className="relative inline-block group">
            <img
              src={getImageUrl(preview)}
              alt="Receipt preview"
              className="h-28 w-auto rounded-xl border border-slate-200 shadow-sm object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setPreview('');
                setReceipt(null);
              }}
              className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1.5 hover:bg-rose-600 shadow-md transition active:scale-95"
              title="Remove receipt"
            >
              <FiX size={14} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 rounded-xl p-5 cursor-pointer transition-all duration-200 group">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200/80 flex items-center justify-center text-slate-500 group-hover:text-blue-600 group-hover:scale-105 transition-all">
              <FiUpload size={18} />
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition">
                Click to upload receipt
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG or WEBP up to 5MB</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <FiCheck size={16} />
              {transaction ? 'Save Changes' : 'Create Transaction'}
            </span>
          )}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;