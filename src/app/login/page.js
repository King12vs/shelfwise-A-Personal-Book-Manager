"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/apiClient";
import PasswordField from "@/components/PasswordField";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("next") || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    if (!form.password) nextErrors.password = "Password is required.";
    return nextErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setIsSubmitting(true);
    try {
      await login(form);
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      // login route only returns a general message, never per-field errors
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-8 text-center">
          <Link href="/" className="font-display text-xl font-semibold tracking-tight">
            Shelfwise
          </Link>
          <h1 className="mt-4 text-2xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-soft">Log in to pick up where you left off.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="card space-y-4 p-6">
          {formError && (
            <div role="alert" className="rounded-card bg-shelf-rust/10 px-3.5 py-2.5 text-sm text-shelf-rust-dark">
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="email" className="field-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="field-input"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <PasswordField
            id="password"
            label="Password"
            autoComplete="current-password"
            value={form.password}
            onChange={(value) => update("password", value)}
            error={errors.password}
          />

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5">
            {isSubmitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          New to Shelfwise?{" "}
          <Link href="/signup" className="font-medium text-shelf-green hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
