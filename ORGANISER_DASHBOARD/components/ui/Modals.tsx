"use client";

// ============================================================================
// Modal & Toast Components
// ============================================================================

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
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
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: "border-green-500/30 bg-green-500/10",
    error: "border-red-500/30 bg-red-500/10",
    warning: "border-amber-500/30 bg-amber-500/10",
    info: "border-cyan-500/30 bg-cyan-500/10",
  };

  const iconColors = {
    success: "text-green-400",
    error: "text-red-400",
    warning: "text-amber-400",
    info: "text-cyan-400",
  };

  const Icon = icons[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className={`
        flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl
        ${colors[toast.type]}
      `}
    >
      <Icon className={`w-5 h-5 mt-0.5 ${iconColors[toast.type]}`} />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-white text-sm">{toast.title}</h4>
        <p className="text-slate-300 text-xs mt-0.5">{toast.message}</p>
      </div>
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
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastNotification key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Confirmation Modal
// ============================================================================
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info",
  isLoading = false,
}: ConfirmModalProps) {
  const buttonColors = {
    danger: "bg-red-500 hover:bg-red-600",
    warning: "bg-amber-500 hover:bg-amber-600",
    info: "bg-cyan-500 hover:bg-cyan-600",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
              <p className="text-slate-300 text-sm mb-6">{message}</p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <motion.button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 ${buttonColors[type]}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Processing...
                    </span>
                  ) : (
                    confirmText
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Alert Card
// ============================================================================
interface AlertCardProps {
  severity: "info" | "warning" | "critical";
  teamName: string;
  issue: string;
  duration: string;
  timestamp: string;
  onDismiss?: () => void;
  onSendMentor?: () => void;
}

export function AlertCard({
  severity,
  teamName,
  issue,
  duration,
  timestamp,
  onDismiss,
  onSendMentor,
}: AlertCardProps) {
  const severityConfig = {
    info: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      icon: Info,
      iconColor: "text-cyan-400",
    },
    warning: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      icon: AlertTriangle,
      iconColor: "text-amber-400",
    },
    critical: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      icon: AlertCircle,
      iconColor: "text-red-400",
    },
  };

  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`p-4 rounded-xl border ${config.bg} ${config.border}`}
    >
      <div className="flex items-start gap-3">
        <motion.div
          animate={severity === "critical" ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-white text-sm truncate">{teamName}</h4>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-slate-300 text-xs mt-1">{issue}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-slate-500">{duration}</span>
            <span className="text-xs text-slate-500">{timestamp}</span>
          </div>
          {onSendMentor && severity !== "info" && (
            <motion.button
              onClick={onSendMentor}
              className="mt-3 w-full py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-medium hover:bg-purple-500/30 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Send Mentor
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
