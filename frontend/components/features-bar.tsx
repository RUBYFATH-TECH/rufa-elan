"use client";

import { Package, ShieldCheck, RotateCcw, Headphones } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export default function FeaturesBar() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Package,
      title: "Free Delivery",
      description: "Orders over GHS 3,000",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: ShieldCheck,
      title: "Secure Payment",
      description: "MoMo, Card, Paystack",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      description: "14-day return policy",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Always here to help",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 group hover:scale-[1.02] transition-transform duration-200"
              >
                <div className={`${feature.bgColor} p-2.5 rounded-lg shrink-0`}>
                  <Icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm mb-0.5 truncate">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-tight">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
