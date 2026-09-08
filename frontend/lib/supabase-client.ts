import { createBrowserClient } from "@supabase/ssr";

export const createClientComponentSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        get(name: string) {
          if (typeof document !== 'undefined') {
            const value = document.cookie
              .split('; ')
              .find(row => row.startsWith(`${name}=`))
              ?.split('=')[1];
            return value ? decodeURIComponent(value) : undefined;
          }
          return undefined;
        },
        set(name: string, value: string, options: any) {
          if (typeof document !== 'undefined') {
            let cookie = `${name}=${encodeURIComponent(value)}`;
            
            if (options?.maxAge) {
              cookie += `; max-age=${options.maxAge}`;
            }
            if (options?.expires) {
              cookie += `; expires=${options.expires}`;
            }
            if (options?.path) {
              cookie += `; path=${options.path}`;
            } else {
              cookie += `; path=/`;
            }
            if (options?.domain) {
              cookie += `; domain=${options.domain}`;
            }
            if (options?.secure) {
              cookie += `; secure`;
            }
            if (options?.httpOnly) {
              // Note: httpOnly cannot be set from client-side JS
              console.warn('httpOnly cannot be set from client-side JavaScript');
            }
            if (options?.sameSite) {
              cookie += `; samesite=${options.sameSite}`;
            }
            
            document.cookie = cookie;
          }
        },
        remove(name: string, options: any) {
          if (typeof document !== 'undefined') {
            let cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
            if (options?.path) {
              cookie += `; path=${options.path}`;
            } else {
              cookie += `; path=/`;
            }
            if (options?.domain) {
              cookie += `; domain=${options.domain}`;
            }
            document.cookie = cookie;
          }
        }
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );
};
