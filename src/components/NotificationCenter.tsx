import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Award, TrendingUp, Leaf, X } from "lucide-react";

interface Notification {
  id: string;
  type: "achievement" | "milestone" | "alert" | "system";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  icon: React.ReactNode;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1", type: "achievement", title: "Achievement Unlocked!", time: "2 min ago", isRead: false,
    message: "You earned the 'Eco Explorer' badge for your first simulation.",
    icon: <Award className="w-4 h-4" style={{ color: "var(--accent)" }} />,
  },
  {
    id: "2", type: "milestone", title: "Carbon Milestone", time: "1 hour ago", isRead: false,
    message: "You've saved over 100 kg of CO2! Keep going to reach 500 kg.",
    icon: <TrendingUp className="w-4 h-4" style={{ color: "var(--accent-secondary)" }} />,
  },
  {
    id: "3", type: "alert", title: "Weekend Travel Alert", time: "3 hours ago", isRead: true,
    message: "Planning a trip this weekend? Simulate eco-friendly routes to save carbon.",
    icon: <Leaf className="w-4 h-4" style={{ color: "var(--accent-tertiary)" }} />,
  },
  {
    id: "4", type: "system", title: "New Feature: Voice AI", time: "1 day ago", isRead: true,
    message: "Try our new voice assistant! Ask sustainability questions hands-free.",
    icon: <Bell className="w-4 h-4" style={{ color: "var(--text-muted)" }} />,
  },
];

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg transition-all"
        style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
        aria-label="Notifications"
        id="notification-center-btn"
      >
        <Bell className="w-3.5 h-3.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center"
            style={{ background: "var(--danger)", color: "white" }}>
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 rounded-xl overflow-hidden shadow-xl z-50"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
              <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[9px] font-semibold uppercase tracking-wider transition-colors"
                  style={{ color: "var(--accent)" }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications list */}
            <div className="max-h-[320px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs" style={{ color: "var(--text-dim)" }}>
                  No notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="flex gap-3 px-4 py-3 border-b transition-colors"
                    style={{
                      borderColor: "var(--border)",
                      background: notif.isRead ? "transparent" : "var(--accent-glow)",
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "var(--surface)" }}>
                      {notif.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>{notif.title}</div>
                      <div className="text-[10px] leading-relaxed mt-0.5" style={{ color: "var(--text-muted)" }}>{notif.message}</div>
                      <div className="text-[9px] mt-1" style={{ color: "var(--text-dim)" }}>{notif.time}</div>
                    </div>
                    <button
                      onClick={() => dismissNotification(notif.id)}
                      className="p-1 rounded shrink-0 self-start"
                      style={{ color: "var(--text-dim)" }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
