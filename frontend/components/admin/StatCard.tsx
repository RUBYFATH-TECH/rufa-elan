"use client";

import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

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
  bgColor = "bg-white/80",
  textColor = "text-slate-900",
  iconBgColor = "bg-blue-100/80",
}: StatCardProps) {
  return (
    <div className={`${bgColor} backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all group`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{title}</p>
          <div className="flex items-baseline gap-3 mb-3">
            <h3 className={`text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent`}>{value}</h3>
            {trend && (
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${trend.isPositive ? "bg-green-100/80 text-green-700" : "bg-red-100/80 text-red-700"}`}>
                {trend.isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span className="text-xs font-bold">{trend.isPositive ? "+" : ""}{trend.value}%</span>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`${iconBgColor} p-3 rounded-xl group-hover:shadow-lg transition-all`}>
            <Icon className="w-6 h-6 text-slate-700" />
          </div>
        )}
      </div>
    </div>
  );
}
