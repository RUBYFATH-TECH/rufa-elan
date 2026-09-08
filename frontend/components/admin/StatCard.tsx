"use client";

import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  bgColor?: string;
  textColor?: string;
  iconBgColor?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  bgColor = "bg-white",
  textColor = "text-slate-900",
  iconBgColor = "bg-blue-100",
}: StatCardProps) {
  return (
    <div className={`${bgColor} rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-3xl font-bold ${textColor}`}>{value}</h3>
            {trend && (
              <span className={`text-sm font-semibold ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-2">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`${iconBgColor} p-3 rounded-lg`}>
            <Icon className="w-6 h-6 text-slate-700" />
          </div>
        )}
      </div>
    </div>
  );
}
