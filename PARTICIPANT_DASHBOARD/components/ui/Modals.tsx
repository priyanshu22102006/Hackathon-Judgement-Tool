"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Bell, CheckCircle, X, Send, HelpCircle, MessageSquare } from "lucide-react";
import type { Toast, DetectedFlag } from "../../types";

interface ToastNotificationProps {
  toast: Toast;
  onClose: () => void;
}

export function ToastNotification({ toast, onClose }: ToastNotificationProps) {
  const icons = {
    warning: <AlertTriangle className="w-5 h-5" />,
    alert: <Bell className="w-5 h-5" />,
    success: <CheckCircle className="w-5 h-5" />,
    info: <Bell className="w-5 h-5" />,
  };

  const colors = {
    warning: "from-yellow-500/20 to-orange-500/20 border-yellow-500/50",
    alert: "from-red-500/20 to-pink-500/20 border-red-500/50",
    success: "from-green-500/20 to-emerald-500/20 border-green-500/50",
    info: "from-blue-500/20 to-cyan-500/20 border-blue-500/50",
  };

  const iconColors = {
    warning: "text-yellow-400",
    alert: "text-red-400",
    success: "text-green-400",
    info: "text-blue-400",
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      className={`bg-gradient-to-r ${colors[toast.type]} backdrop-blur-xl border rounded-xl p-4 shadow-2xl max-w-sm`}
    >
      <div className="flex items-start gap-3">
        <div className={iconColors[toast.type]}>{icons[toast.type]}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-white">{toast.title}</h4>
          <p className="text-sm text-gray-300 mt-1">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: number) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            toast={toast}
            onClose={() => onRemove(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ExplanationModalProps {
  flag: Pick<DetectedFlag, "id" | "flagName" | "reason">;
  onClose: () => void;
  onSubmit: (id: number, explanation: string) => void;
  submitting?: boolean;
}

export function ExplanationModal({
  flag,
  onClose,
  onSubmit,
  submitting = false,
}: ExplanationModalProps) {
  const [explanation, setExplanation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (explanation.trim()) {
      onSubmit(flag.id, explanation);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-gray-900/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Submit Explanation</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
          <p className="text-red-300 font-semibold">{flag.flagName}</p>
          <p className="text-gray-400 text-sm mt-1">{flag.reason}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="e.g., Offline work for design assets, team discussion break, etc."
            className="w-full bg-gray-800/50 border border-gray-600 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none h-32"
            disabled={submitting}
          />
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={submitting || !explanation.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold hover:from-purple-500 hover:to-cyan-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Submitting..." : "Submit"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

interface MentorHelpModalProps {
  onClose: () => void;
  onSubmit: (message: string) => void;
  submitting?: boolean;
}

export function MentorHelpModal({
  onClose,
  onSubmit,
  submitting = false,
}: MentorHelpModalProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (message.trim()) {
      onSubmit(message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xl font-bold text-white">Request Mentor Help</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-400 mb-4">
          Describe your issue and a mentor will be assigned to help you.
        </p>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g., Need help with API integration, stuck on authentication flow..."
          className="w-full bg-gray-800/50 border border-gray-600 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none h-32"
          disabled={submitting}
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-2 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <motion.button
            onClick={handleSubmit}
            disabled={submitting || !message.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-semibold hover:from-cyan-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Sending..." : "Send Request"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
