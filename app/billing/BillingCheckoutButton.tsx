"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BillingCheckoutButton({ action = "checkout" }: { action?: "checkout" | "portal" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onClick() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/stripe/${action}`, { method: "POST" });
      const data = await response.json();

      if (!response.ok || !data.url) {
        setError(data.error || "Billing is temporarily unavailable.");
        if (response.status === 409) router.refresh();
        setLoading(false);
        return;
      }

      window.location.assign(data.url);
    } catch {
      setError("Billing is temporarily unavailable. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-100 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Redirecting…" : action === "portal" ? "Manage billing" : "Start 7-day free trial"}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-red-300">{error}</p>}
    </div>
  );
}
