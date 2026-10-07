"use client";
import { useActionState } from "react";
import { loginAction } from "@/lib/blog/actions";
export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { message: "" });
  return (
    <form action={action}>
      <label className="blog-field">
        Owner email
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          maxLength={254}
        />
      </label>
      <label className="blog-field">
        Password
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          maxLength={128}
        />
      </label>
      <div className="blog-login-actions">
        <button
          className="blog-button"
          name="intent"
          value="password"
          disabled={pending}
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
        <button
          className="blog-button secondary"
          name="intent"
          value="link"
          formNoValidate
          disabled={pending}
        >
          Email me a link instead
        </button>
      </div>
      <p className="blog-message" role="status">
        {state.message}
      </p>
    </form>
  );
}
