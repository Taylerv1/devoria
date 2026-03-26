"use client";

import { FormEvent, useState } from "react";
import { HiCheck } from "react-icons/hi";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

export default function ContactForm() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "contact",
          name: form.get("name"),
          email: form.get("email"),
          subject: form.get("subject"),
          message: form.get("message"),
        }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message.");
      }

      formElement.reset();
      setSent(true);
    } catch {
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card hover={false} className="p-5 sm:p-7 lg:p-8">
      {sent ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-3xl text-[var(--color-accent)]">
            <HiCheck />
          </div>
          <h3 className="text-xl font-semibold text-white">Message Sent!</h3>
          <p className="mt-2 text-[var(--color-text-muted)]">
            We&apos;ll get back to you within 24 hours.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Name"
              name="name"
              placeholder="Ali Hassan"
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="ali@example.com"
              required
            />
          </div>
          <Input
            label="Subject"
            name="subject"
            placeholder="Project inquiry"
            required
          />
          <Textarea
            label="Message"
            name="message"
            placeholder="Tell us about your project..."
            required
          />
          <Button type="submit" size="lg" disabled={sending}>
            {sending ? "Sending..." : "Send Message"}
          </Button>
        </form>
      )}
    </Card>
  );
}
