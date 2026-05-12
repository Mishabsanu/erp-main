import React, { useState, useCallback } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface PasswordDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (password: string) => Promise<void> | void;
}

const PasswordDrawer: React.FC<PasswordDrawerProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = useCallback(() => {
    setPasswordError('');
    setConfirmError('');

    if (!newPassword || newPassword.trim().length < 6) {
      setPasswordError('Minimum 6 characters required');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setConfirmError('Passwords do not match');
      return false;
    }

    return true;
  }, [newPassword, confirmPassword]);

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      await onSubmit(newPassword);
      toast.success('Password updated successfully');
      onClose();
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998] transition-opacity animate-fadeIn"
        onClick={onClose}
      ></div>

      <div className="fixed right-0 top-0 h-full w-[400px] bg-white shadow-xl z-[9999] animate-slideFromRight flex flex-col border-l border-gray-100">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            Update Password
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700 transition"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 px-6 py-5 space-y-4 overflow-y-auto">
          <div>
            <label className="text-sm font-medium text-gray-700">
              New Password <span className="text-teal-500">*</span>
            </label>

            <div
              className={`relative mt-1 rounded-xl bg-gray-50 border transition overflow-hidden ${
                passwordError
                  ? 'border-red-500'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type={showNewPass ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="w-full px-3 py-2.5 bg-transparent outline-none text-gray-800"
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowNewPass(!showNewPass)}
              >
                {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {passwordError && (
              <p className="text-red-600 text-xs mt-1">{passwordError}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Confirm Password <span className="text-teal-500">*</span>
            </label>

            <div
              className={`relative mt-1 rounded-xl bg-gray-50 border transition overflow-hidden ${
                confirmError
                  ? 'border-red-500'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type={showConfirmPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="w-full px-3 py-2.5 bg-transparent outline-none text-gray-800"
                placeholder="Confirm password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
              >
                {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {confirmError && (
              <p className="text-red-600 text-xs mt-1">{confirmError}</p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-2.5 rounded-xl font-medium text-white transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#0f766e] hover:opacity-90'
            }`}
          >
            {loading ? 'Saving...' : 'Save Password'}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideFromRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0%);
          }
        }
        .animate-slideFromRight {
          animation: slideFromRight 0.35s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease;
        }
      `}</style>
    </>
  );
};

export default PasswordDrawer;
