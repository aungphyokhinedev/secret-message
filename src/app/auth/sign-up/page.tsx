import { redirect } from "next/navigation";
import { safeRedirectPath } from "@/lib/safe-redirect-path";

type SignUpPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { next: nextParam } = await searchParams;
  const afterAuth = safeRedirectPath(nextParam);
  redirect(`/auth/sign-in?next=${encodeURIComponent(afterAuth)}`);
}
