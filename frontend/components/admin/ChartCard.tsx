"use client";

import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: string;
  action?: ReactNode;
  height?: string;
}

export default function ChartCard({
  title,
  subtitle,
  children,
  footer,
  action,
  height = "h-80",
}: ChartCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 p-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className={`p-6 ${height}`}>
        {children}
      </div>
      {footer && (
        <div className="border-t border-slate-200 px-6 py-3 bg-slate-50 text-sm text-slate-600">
          {footer}
        </div>
      )}
    </div>
  );
}
