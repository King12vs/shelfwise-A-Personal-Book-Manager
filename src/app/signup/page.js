"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/apiClient";
import PasswordField from "@/components/PasswordField";

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const nextErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = "Name must be at least 2 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Enter a valid email address.";
    if (!PASSWORD_REGEX.test(form.password)) {
      nextErrors.password = "Use at least 8 characters, with a letter and a number.";
    }
    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Passwords don't match.";
    }
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
      await signup(form);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fields);
        if (!err.fields || Object.keys(err.fields).length === 0) setFormError(err.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
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
          <h1 className="mt-4 text-2xl font-semibold">Build your shelf</h1>
          <p className="mt-1 text-sm text-ink-soft">Takes less than a minute.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="card space-y-4 p-6">
          {formError && (
            <div role="alert" className="rounded-card bg-shelf-rust/10 px-3.5 py-2.5 text-sm text-shelf-rust-dark">
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="name" className="field-label">
              Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              className="field-input"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

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
            autoComplete="new-password"
            value={form.password}
            onChange={(value) => update("password", value)}
            error={errors.password}
            hint="At least 8 characters, with a letter and a number."
          />

          <PasswordField
            id="confirmPassword"
            label="Confirm password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(value) => update("confirmPassword", value)}
            error={errors.confirmPassword}
          />

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5">
            {isSubmitting ? "Creating your shelf…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-shelf-green hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
