"use client";

import { useState } from "react";

export default function BillingCheckoutButton() {
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await response.json();

      if (!response.ok || !data?.url) {
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-100 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? "Redirecting..." : "Start Free Trial"}
    </button>
  );
}
