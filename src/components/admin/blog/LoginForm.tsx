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
      <button className="blog-button" disabled={pending}>
        {pending ? "Sending…" : "Send sign-in link"}
      </button>
      <p className="blog-message" role="status">
        {state.message}
      </p>
    </form>
  );
}
