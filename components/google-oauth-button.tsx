"use client";

interface GoogleOAuthButtonProps {
  onClick: () => Promise<void>;
  disabled?: boolean;
  label?: string;
}

export function GoogleOAuthButton({ onClick, disabled, label = "Continue with Google" }: GoogleOAuthButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
        <svg viewBox="0 0 46 46" className="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
          <path d="M23 9.2c3.4 0 6.3 1.2 8.4 3.3l6.3-6.3C34.8 2.8 29.5 0 23 0 13.7 0 5.9 5.4 2.3 13.1l7.5 5.8C11.4 13.3 16.7 9.2 23 9.2z" fill="#EA4335" />
          <path d="M45.9 23.5c0-1.5-.1-2.9-.3-4.3H23v8.2h12.5c-.5 2.7-2.1 5-4.6 6.6l7.2 5.6c4.2-3.9 6.6-9.6 6.6-16.1z" fill="#4285F4" />
          <path d="M9.8 27.2c-.5-1.5-.8-3.2-.8-4.9 0-1.7.3-3.4.8-4.9L2.3 11.6C.8 14.8 0 18.3 0 22s.8 7.2 2.3 10.4l7.5-5.8z" fill="#FBBC05" />
          <path d="M23 45.9c6.5 0 12-2.1 16-5.7l-7.7-6c-2.2 1.5-4.9 2.4-8.3 2.4-6.3 0-11.6-4.1-13.5-9.6l-7.5 5.8C5.9 40.6 13.7 45.9 23 45.9z" fill="#34A853" />
        </svg>
      </span>
      {label}
    </button>
  );
}
