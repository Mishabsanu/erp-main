import { toast } from 'sonner';

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export const confirmDelete = (
  onConfirm: () => void | Promise<void>,
  options: ConfirmOptions = {}
) => {
  const {
    title = "Are you sure you want to delete this?",
    description = "This action is permanent and cannot be reversed.",
    confirmLabel = "Confirm Delete",
    cancelLabel = "Cancel"
  } = options;

  toast(title, {
    description,
    duration: 5000,
    action: {
      label: confirmLabel,
      onClick: onConfirm,
    },
    actionButtonStyle: {
      backgroundColor: '#ef4444',
      color: 'white',
      fontWeight: 'bold'
    },
    cancel: {
      label: cancelLabel,
      onClick: () => {},
    },
  });
};
