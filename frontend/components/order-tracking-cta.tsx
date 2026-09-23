"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, MapPin, Package, Truck } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export default function OrderTrackingCta() {
  const router = useRouter();
  const { language } = useLanguage();
  const [orderNumber, setOrderNumber] = useState("");
  const localized = (copy: { en: string; tr: string; ar: string }) => copy[language === "tr" || language === "ar" ? language : "en"];
  const benefits = [
    { title: localized({ en: "Real-time map", tr: "Canlı harita", ar: "خريطة مباشرة" }), description: localized({ en: "See your package move along the delivery route", tr: "Paketinizin teslimat rotasındaki hareketini görün", ar: "تابعي شحنتك على مسار التوصيل" }), icon: MapPin },
    { title: localized({ en: "Order items", tr: "Sipariş ürünleri", ar: "منتجات الطلب" }), description: localized({ en: "View purchased items with quantities and prices", tr: "Satın alınan ürünleri, miktarları ve fiyatları görüntüleyin", ar: "اعرضي المنتجات المشتراة وكمياتها وأسعارها" }), icon: Package },
    { title: localized({ en: "Delivery timeline", tr: "Teslimat zaman çizelgesi", ar: "الجدول الزمني للتسليم" }), description: localized({ en: "Complete history from payment to delivery", tr: "Ödemeden teslimata kadar tüm geçmiş", ar: "السجل الكامل من الدفع حتى التسليم" }), icon: Check },
    { title: localized({ en: "Progress updates", tr: "İlerleme güncellemeleri", ar: "تحديثات التقدم" }), description: localized({ en: "Live percentage indicator of delivery completion", tr: "Teslimat tamamlanma oranını canlı takip edin", ar: "مؤشر مباشر لنسبة إتمام التسليم" }), icon: Truck },
  ];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = orderNumber.trim();
    router.push(query ? `/order-tracking?orderNumber=${encodeURIComponent(query)}` : "/order-tracking");
  }

  return (
    <section className="bg-[#030817] px-4 py-14 text-white sm:px-6 sm:py-20" aria-labelledby="order-tracking-heading">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.92fr_1fr] lg:gap-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-indigo-300">{localized({ en: "Track your order", tr: "Siparişini takip et", ar: "تتبّع طلبك" })}</p>
          <h2 id="order-tracking-heading" className="mt-7 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            {localized({ en: "Real-time delivery tracking", tr: "Gerçek zamanlı teslimat takibi", ar: "تتبّع التسليم في الوقت الفعلي" })}
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            {localized({ en: "Enter your order number to see live delivery status, map location, estimated arrival time, and your purchased items.", tr: "Canlı teslimat durumunu, harita konumunu, tahmini varış süresini ve satın aldığınız ürünleri görmek için sipariş numaranızı girin.", ar: "أدخلي رقم طلبك لمعرفة حالة التسليم المباشرة وموقع الخريطة ووقت الوصول المتوقع والمنتجات التي اشتريتها." })}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
            <label htmlFor="order-number" className="sr-only">Order number</label>
            <input
              id="order-number"
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value)}
              placeholder="e.g. RUFA-1001"
              className="h-12 min-w-0 flex-1 rounded-full border border-slate-600 bg-slate-800 px-5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
            />
            <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-500">
              <Truck className="h-4 w-4" />
              {localized({ en: "Track order", tr: "Siparişi takip et", ar: "تتبّع الطلب" })}
            </button>
          </form>

          <p className="mt-5 text-sm text-sky-200/85">
            {localized({ en: "Try:", tr: "Dene:", ar: "جرّبي:" })} <button type="button" onClick={() => setOrderNumber("RUFA-1001")} className="ml-2 hover:text-white">RUFA-1001</button>
            <button type="button" onClick={() => setOrderNumber("RUFA-1002")} className="ml-4 hover:text-white">RUFA-1002</button>
            <button type="button" onClick={() => setOrderNumber("RUFA-1003")} className="ml-4 hover:text-white">RUFA-1003</button>
          </p>
        </div>

        <div className="rounded-[2rem] border border-slate-700/80 bg-slate-900/90 p-6 shadow-2xl shadow-black/25 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/20">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <div>
              <p className="text-sm font-bold text-white">{localized({ en: "Live tracking available", tr: "Canlı takip mevcut", ar: "التتبّع المباشر متاح" })}</p>
              <p className="mt-0.5 text-xs text-sky-200/80">{localized({ en: "Updates every 5 seconds with map position", tr: "Harita konumuyla her 5 saniyede bir güncellenir", ar: "تحديث كل 5 ثوانٍ مع موقع الخريطة" })}</p>
            </div>
          </div>

          <div className="mt-7 space-y-5">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
                    <Icon className="h-3 w-3" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{benefit.title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-sky-200/80">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <button type="button" onClick={() => router.push("/order-tracking")} className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-slate-600 bg-slate-800 text-sm font-semibold text-white transition hover:bg-slate-700">
            {localized({ en: "Go to order tracking page", tr: "Sipariş takip sayfasına git", ar: "الانتقال إلى صفحة تتبّع الطلب" })} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
