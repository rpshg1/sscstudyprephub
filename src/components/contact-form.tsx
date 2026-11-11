"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";

export function ContactComplaintForm({
  defaultType = "GENERAL",
  defaultSlug = "",
}: {
  defaultType?: "COPYRIGHT_DMCA" | "CONTENT_ERROR" | "PAYMENT_SUPPORT" | "GENERAL";
  defaultSlug?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState(defaultType);
  const [resourceSlug, setResourceSlug] = useState(defaultSlug);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          type,
          resourceSlug: resourceSlug || null,
          subject,
          message,
          evidenceUrl: evidenceUrl || null,
        }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        setError(data.error || "Could not submit your request.");
        return;
      }
      setSuccess(
        data.message || "Your inquiry has been submitted to the SSPH review team."
      );
      setSubject("");
      setMessage("");
      setEvidenceUrl("");
    } catch {
      setError("Network error while sending message.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6 sm:p-8">
      <h2 className="text-xl font-bold text-[#101B33]">
        Submit Support Ticket or Copyright Notice
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        All submissions are logged directly for administrator review.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold">Full Name *</label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold">Email Address *</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold">Request Category *</label>
            <Select
              value={type}
              onChange={(e) =>
                setType(
                  e.target.value as
                    | "COPYRIGHT_DMCA"
                    | "CONTENT_ERROR"
                    | "PAYMENT_SUPPORT"
                    | "GENERAL"
                )
              }
            >
              <option value="GENERAL">General Inquiry</option>
              <option value="PAYMENT_SUPPORT">Payment / Credit Support</option>
              <option value="CONTENT_ERROR">Content Error / Broken Link</option>
              <option value="COPYRIGHT_DMCA">Copyright / DMCA Takedown</option>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold">
              Related Resource Slug (Optional)
            </label>
            <Input
              value={resourceSlug}
              onChange={(e) => setResourceSlug(e.target.value)}
              placeholder="e.g. ssc-cgl-mathematics-notes-demo"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold">Subject *</label>
          <Input
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief summary of your inquiry or notice"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold">Message / Details *</label>
          <Textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Provide full details. For copyright claims, identify the copyrighted work and confirm ownership or authorization."
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold">
            Supporting Reference URL (Optional)
          </label>
          <Input
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <Button type="submit" size="lg" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit Request
        </Button>
      </form>
    </Card>
  );
}
