"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";
import type { Toast } from "../../types";

// ============================================================================
// Toast Notification
// ============================================================================
interface ToastNotificationProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export function ToastNotification({ toast, onDismiss }: ToastNotificationProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-cyan-400" />,
  };

  const bgColors = {
    success: "from-green-500/20 to-green-500/5 border-green-500/30",
    error: "from-red-500/20 to-red-500/5 border-red-500/30",
    warning: "from-amber-500/20 to-amber-500/5 border-amber-500/30",
    info: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`
        flex items-center gap-3 p-4 rounded-xl border backdrop-blur-xl
        bg-gradient-to-r ${bgColors[toast.type]}
        shadow-xl max-w-sm
      `}
    >
      {icons[toast.type]}
      <p className="text-sm text-white flex-1">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ============================================================================
// Toast Container
// ============================================================================
interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            toast={toast}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Success Modal (for registration success)
// ============================================================================
interface SuccessModalProps {
  isOpen: boolean;
  teamId: string;
  onClose: () => void;
}

export function SuccessModal({ isOpen, teamId, onClose }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl w-full max-w-md p-8 text-center"
        >
          {/* Success animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.4 }}
            >
              <CheckCircle className="w-10 h-10 text-green-400" />
            </motion.div>
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Registration Successful!
          </h2>
          <p className="text-slate-400 mb-4">
            Your team has been registered for the hackathon.
          </p>
          
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
            <p className="text-xs text-slate-400 mb-1">Team ID</p>
            <p className="font-mono text-purple-400">{teamId}</p>
          </div>

          <p className="text-sm text-slate-500 mb-6">
            Repository webhooks have been configured. Your team's activity will be tracked transparently.
          </p>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
