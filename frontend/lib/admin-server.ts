import { createServerSupabase } from "@/lib/supabase-server";
import { createServerAdminSupabase } from "@/lib/supabase-admin";
import { isKnownAdminEmail } from "@/lib/admin-common";

export type AdminUser = {
  id: string;
  email: string;
  role: string;
};

export async function getAdminSupabase() {
  const supabase = await createServerSupabase();
  const serviceSupabase = await createServerAdminSupabase();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    return { error: "unauthorized" as const };
  }

  const email = user.email?.trim().toLowerCase() ?? "";
  const { data: adminUser, error } = await supabase
    .from("admin_users")
    .select("id, email, role")
    .ilike("email", email)
    .maybeSingle();

  if (error || !adminUser) {
    if (isKnownAdminEmail(email)) {
      return {
        supabase,
        serviceSupabase,
        adminUser: { id: "known-admin", email, role: "admin" }
      } as const;
    }

    return { error: "forbidden" as const };
  }

  return { supabase, serviceSupabase, adminUser } as const;
}
