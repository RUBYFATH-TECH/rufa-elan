"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Phone, ChevronUp } from "lucide-react";

interface LiveContactButtonProps {
  whatsappNumber?: string;
  phoneNumber?: string;
}

export default function LiveContactButton({ 
  whatsappNumber = '+905053783510', 
  phoneNumber = '+233241234567' 
}: LiveContactButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Format phone number for display (remove country code for cleaner look)
  const formatPhoneDisplay = (phone: string) => {
    return phone.replace(/^\+\d{1,3}\s?/, '');
  };

  return (
    <div ref={dropdownRef} className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6">
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-lg animate-in slide-in-from-bottom-2 fade-in-0">
          <div className="p-2 space-y-1">
            {/* WhatsApp Option */}
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-green-50 hover:text-green-700 group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">WhatsApp</div>
                <div className="text-xs text-slate-500 group-hover:text-green-600">Chat with us</div>
              </div>
            </a>

            {/* Phone Call Option */}
            <a
              href={`tel:${phoneNumber}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-blue-50 hover:text-blue-700 group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Phone className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">Call Us</div>
                <div className="text-xs text-slate-500 group-hover:text-blue-600">{formatPhoneDisplay(phoneNumber)}</div>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-3 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-brand-800 hover:shadow-xl active:scale-95 md:px-4 md:py-3"
        aria-label="Live Contact"
        aria-expanded={isOpen}
      >
        <MessageSquare className="h-4 w-4" />
        <span>Live Contact</span>
        <ChevronUp 
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
    </div>
  );
}
