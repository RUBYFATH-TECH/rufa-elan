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
    <div className={`${bgColor} relative min-w-0 overflow-hidden backdrop-blur-sm rounded-2xl border border-slate-200/50 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all group`}>
      <div>
        <div className="min-w-0 flex-1">
          <p className="pr-14 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{title}</p>
          <div className="flex flex-col items-start gap-2 mb-3">
            <h3 className={`max-w-full text-[clamp(1.5rem,2vw,2rem)] font-bold leading-tight tabular-nums bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent`}>{value}</h3>
            {trend && (
              <div className={`flex shrink-0 items-center gap-1 px-2.5 py-1 rounded-full ${trend.isPositive ? "bg-green-100/80 text-green-700" : "bg-red-100/80 text-red-700"}`}>
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
          <div className={`${iconBgColor} absolute right-5 top-5 sm:right-6 sm:top-6 p-3 rounded-xl group-hover:shadow-lg transition-all`}>
            <Icon className="w-6 h-6 text-slate-700" />
          </div>
        )}
      </div>
    </div>
  );
}
