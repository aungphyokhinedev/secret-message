"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  signInAction,
  signUpAction,
  type AuthActionState,
} from "@/app/auth/actions";

import { OAuthGoogleButton } from "@/components/auth/oauth-google-button";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  initialError?: string;
  /** Post-auth redirect (relative path only). */
  redirectTo?: string;
};

export function AuthForm({ mode, initialError, redirectTo }: AuthFormProps) {
  const isSignIn = mode === "sign-in";
  const action = isSignIn ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    action,
    null,
  );

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
      <h1 className="text-2xl font-semibold">{isSignIn ? "Welcome back" : "Create account"}</h1>
      <p className="mt-2 text-sm text-slate-300">
        {isSignIn
          ? "Sign in to send secret messages and gifts."
          : "Start sharing private messages and virtual surprises."}
      </p>

      <OAuthGoogleButton nextPath={redirectTo} />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <span className="w-full border-t border-white/15" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-[0.2em]">
          <span className="bg-black/40 px-2 text-slate-400">Or email</span>
        </div>
      </div>

      <form className="mt-0 space-y-4" action={formAction}>
        {redirectTo ? <input type="hidden" name="next" value={redirectTo} /> : null}
        <label className="block text-sm">
          <span className="mb-1 block text-slate-200">Email</span>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2 outline-none ring-cyan-300 transition focus:ring"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-200">Password</span>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2 outline-none ring-cyan-300 transition focus:ring"
            placeholder="At least 6 characters"
            autoComplete={isSignIn ? "current-password" : "new-password"}
          />
        </label>

        {initialError && !state?.error ? (
          <p className="text-sm text-rose-300">{initialError}</p>
        ) : null}
        {state?.error ? <p className="text-sm text-rose-300">{state.error}</p> : null}
        {state?.message ? <p className="text-sm text-emerald-300">{state.message}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Please wait..." : isSignIn ? "Sign In" : "Sign Up"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-300">
        {isSignIn ? "Need an account?" : "Already have an account?"}{" "}
        <Link
          href={isSignIn ? "/auth/sign-up" : "/auth/sign-in"}
          className="font-medium text-cyan-300"
        >
          {isSignIn ? "Sign up" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
