import { MessageSquare } from "lucide-react";

export default function WhatsappButton() {
  return (
    <a
      href="https://wa.me/+905053783510"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-20 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-brand-700 px-3 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-800 md:bottom-6 md:right-6 md:px-4 md:py-3"
    >
      <MessageSquare className="h-4 w-4" /> WhatsApp
    </a>
  );
}
