"use client";

import { startTransition, useActionState } from "react";
import { Loader2 } from "lucide-react";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form
      action={action}
      // Submit manually so a failed attempt doesn't clear the username field.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="space-y-4"
    >
      <div>
        <label htmlFor="username" className="label">Username</label>
        <input id="username" name="username" type="text" required autoComplete="username" autoCapitalize="none" spellCheck={false} className="field" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="field" />
      </div>
      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}
      <button type="submit" disabled={pending} className="btn-dark w-full">
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        Sign in
      </button>
    </form>
  );
}
