import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiTag,
  FiTrendingUp,
  FiTrendingDown,
  FiFolder,
  FiLock,
  FiCheck,
} from 'react-icons/fi';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expense');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'expense' });
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data.categories || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditing(null);
    setForm({ name: '', type: activeTab });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, type: cat.type });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Category name is required');

    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/categories/${editing._id}`, { name: form.name });
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', form);
        toast.success('Category created successfully');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/categories/${deleteTarget._id}`);
      toast.success('Category deleted successfully');
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = categories.filter((c) => c.type === activeTab);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner / Controls */}
      <div className="card !p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FiFolder className="text-blue-600" />
              <span>Category Organization</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Customize categories to classify your income and expenses accurately
            </p>
          </div>

          <button
            type="button"
            className="btn-primary shrink-0 !py-2.5 text-xs sm:text-sm"
            onClick={openAddModal}
          >
            <FiPlus size={18} className="stroke-[2.5]" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Tab switch */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveTab('expense')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FiTrendingDown size={15} />
              <span>Expense Categories ({categories.filter((c) => c.type === 'expense').length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('income')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'income'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FiTrendingUp size={15} />
              <span>Income Categories ({categories.filter((c) => c.type === 'income').length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Category Cards */}
      {loading ? (
        <Loader text="Loading categories..." />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiTag}
            title={`No ${activeTab} categories found`}
            description={`Create your first custom ${activeTab} category to organize your transactions.`}
            action={
              <button className="btn-primary text-xs" onClick={openAddModal}>
                <FiPlus /> Add Category
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cat) => (
            <div
              key={cat._id}
              className="card-interactive flex items-center justify-between !p-4.5 group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105 ${
                    cat.type === 'income'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-rose-50 text-rose-600 border border-rose-100'
                  }`}
                >
                  <FiTag size={20} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-slate-800 truncate group-hover:text-blue-600 transition">
                    {cat.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {cat.isDefault ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                        <FiLock size={10} /> Default
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                        Custom
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!cat.isDefault && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(cat)}
                    className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition active:scale-95"
                    title="Edit Category"
                  >
                    <FiEdit2 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(cat)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition active:scale-95"
                    title="Delete Category"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Category' : 'Create New Category'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Category Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Dining Out, Subscriptions, Salary"
              className="input font-medium"
              maxLength={50}
              autoFocus
              required
            />
          </div>

          {!editing && (
            <div>
              <label className="label">Category Type</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'expense' })}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    form.type === 'expense'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'income' })}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    form.type === 'income'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Income
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <FiCheck size={16} />
                  {editing ? 'Update' : 'Create'}
                </span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Category Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Existing transactions with this category will remain intact.`}
        loading={deleting}
      />
    </div>
  );
};

export default Categories;