"use client";

import { ReactNode } from "react";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
}

const variantStyles = {
  default: "bg-slate-100 text-slate-700 border-slate-300",
  success: "bg-green-100 text-green-700 border-green-300",
  warning: "bg-yellow-100 text-yellow-700 border-yellow-300",
  error: "bg-red-100 text-red-700 border-red-300",
  info: "bg-blue-100 text-blue-700 border-blue-300",
};

const sizeStyles = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
  lg: "px-4 py-2 text-base",
};

const statusVariantMap: Record<string, keyof typeof variantStyles> = {
  // Order statuses
  pending_payment: "warning",
  processing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "error",
  
  // Payment statuses
  unpaid: "error",
  paid: "success",
  refunded: "warning",
  
  // Product statuses
  active: "success",
  inactive: "default",
  out_of_stock: "error",
};

export default function StatusBadge({
  status,
  variant = statusVariantMap[status.toLowerCase()] as keyof typeof variantStyles || "default",
  size = "md",
  icon,
}: StatusBadgeProps) {
  const displayStatus = status.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center gap-2 font-medium border rounded-full ${variantStyles[variant]} ${sizeStyles[size]} whitespace-nowrap`}
    >
      {icon}
      {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
    </span>
  );
}
