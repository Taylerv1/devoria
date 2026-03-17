"use client";

import { useState, FormEvent } from "react";
import Section from "@/components/layout/Section";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { HiMail, HiLocationMarker, HiPhone } from "react-icons/hi";

const contactInfo = [
  {
    icon: <HiMail className="text-xl" />,
    label: "Email",
    value: "hello@devoria.dev",
  },
  {
    icon: <HiPhone className="text-xl" />,
    label: "Phone",
    value: "+1 (555) 000-0000",
  },
  {
    icon: <HiLocationMarker className="text-xl" />,
    label: "Location",
    value: "San Francisco, CA",
  },
];

export default function ContactPage() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);

    const formElement = e.currentTarget;
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
    <Section>
      <PageHeader
        title="Contact Us"
        description="Have a project in mind? Let's talk about how we can help bring your vision to life."
      />

      <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
        {/* Contact info */}
        <div className="space-y-4 sm:space-y-6">
          {contactInfo.map((info) => (
            <Card key={info.label} hover={false}>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary-light)]">
                  {info.icon}
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {info.label}
                  </p>
                  <p className="font-medium text-white">{info.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <Card hover={false} className="p-5 sm:p-7 lg:p-8">
            {sent ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-3xl text-[var(--color-accent)]">
                  ✓
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Message Sent!
                </h3>
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
                    placeholder="John Doe"
                    required
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
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
        </div>
      </div>
    </Section>
  );
}
