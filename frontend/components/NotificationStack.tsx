"use client";

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { Notification } from "@/lib/hooks/useNotification";

interface NotificationStackProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export default function NotificationStack({
  notifications,
  onRemove,
}: NotificationStackProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="pointer-events-auto animate-in slide-in-from-right fade-in"
        >
          <div
            className={`rounded-lg shadow-lg border p-4 flex gap-3 ${
              notification.type === "success"
                ? "bg-green-50 border-green-200"
                : notification.type === "error"
                ? "bg-red-50 border-red-200"
                : notification.type === "warning"
                ? "bg-yellow-50 border-yellow-200"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <div className="flex-shrink-0">
              {notification.type === "success" && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
              {notification.type === "error" && (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              {notification.type === "warning" && (
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              )}
              {notification.type === "info" && (
                <Info className="w-5 h-5 text-blue-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3
                className={`text-sm font-semibold ${
                  notification.type === "success"
                    ? "text-green-900"
                    : notification.type === "error"
                    ? "text-red-900"
                    : notification.type === "warning"
                    ? "text-yellow-900"
                    : "text-blue-900"
                }`}
              >
                {notification.title}
              </h3>
              {notification.message && (
                <p
                  className={`text-sm mt-1 ${
                    notification.type === "success"
                      ? "text-green-800"
                      : notification.type === "error"
                      ? "text-red-800"
                      : notification.type === "warning"
                      ? "text-yellow-800"
                      : "text-blue-800"
                  }`}
                >
                  {notification.message}
                </p>
              )}
            </div>

            <button
              onClick={() => onRemove(notification.id)}
              className={`flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors ${
                notification.type === "success"
                  ? "text-green-600"
                  : notification.type === "error"
                  ? "text-red-600"
                  : notification.type === "warning"
                  ? "text-yellow-600"
                  : "text-blue-600"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
