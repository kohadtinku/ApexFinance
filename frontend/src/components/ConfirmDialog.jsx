import Modal from './Modal.jsx';
import { FiAlertTriangle } from 'react-icons/fi';

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  loading,
  confirmLabel = 'Delete',
}) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <div className="flex items-start gap-4 mb-6">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0 shadow-sm">
        <FiAlertTriangle size={24} />
      </div>
      <div>
        <p className="text-sm text-slate-600 leading-relaxed mt-1">{message}</p>
        <p className="text-xs text-slate-600 mt-2">This action is permanent and cannot be undone.</p>
      </div>
    </div>

    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
      <button
        type="button"
        className="btn-secondary"
        onClick={onClose}
        disabled={loading}
      >
        Cancel
      </button>
      <button
        type="button"
        className="btn-danger"
        onClick={onConfirm}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
            Deleting...
          </span>
        ) : (
          confirmLabel
        )}
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;