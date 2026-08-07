import { MessageSquare } from "lucide-react";

export default function WhatsappButton() {
  return (
    <a
      href="https://wa.me/+905053783510"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-3 rounded-full bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-800"
    >
      <MessageSquare className="h-4 w-4" /> WhatsApp
    </a>
  );
}
