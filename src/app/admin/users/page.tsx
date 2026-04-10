import { notFound, redirect } from "next/navigation";

import { UserFlagsTable } from "@/components/admin/user-flags-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminUsersPage() {
  if (!hasSupabaseEnv()) notFound();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?next=%2Fadmin%2Fusers");

  const { data: me } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!me?.is_admin) redirect("/dashboard");

  const { data: users } = await supabase
    .from("profiles")
    .select("id, username, is_premium, is_blocked, is_admin")
    .order("username");

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Card className="rounded-xl border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>User Flags Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <UserFlagsTable rows={users ?? []} />
        </CardContent>
      </Card>
    </main>
  );
}

