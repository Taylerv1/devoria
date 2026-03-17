import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { FieldValue, getFirebaseAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

type MessageSource = "contact" | "project_interest";

interface MessagePayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  source?: MessageSource;
  projectTitle?: string;
  projectSlug?: string;
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeMessagePayload(body: unknown): MessagePayload | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const payload = body as Record<string, unknown>;
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const subject =
    typeof payload.subject === "string" ? payload.subject.trim() : "";
  const message =
    typeof payload.message === "string" ? payload.message.trim() : "";
  const source =
    payload.source === "project_interest" ? "project_interest" : "contact";
  const projectTitle =
    typeof payload.projectTitle === "string" ? payload.projectTitle.trim() : undefined;
  const projectSlug =
    typeof payload.projectSlug === "string" ? payload.projectSlug.trim() : undefined;

  if (
    !name ||
    !email ||
    !subject ||
    !message ||
    !isValidEmail(email) ||
    name.length > 200 ||
    subject.length > 300 ||
    message.length > 5000
  ) {
    return null;
  }

  return {
    name,
    email,
    subject,
    message,
    source,
    projectTitle,
    projectSlug,
  };
}

async function sendNotificationEmail(payload: MessagePayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const toEmail = process.env.RESEND_TO_EMAIL;

  if (!apiKey || !toEmail) {
    return {
      sent: false,
      reason: "Resend is not configured. Add RESEND_API_KEY and RESEND_TO_EMAIL.",
    };
  }

  const recipients = toEmail
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    return {
      sent: false,
      reason: "RESEND_TO_EMAIL is empty.",
    };
  }

  const resend = new Resend(apiKey);
  const sourceLabel =
    payload.source === "project_interest" ? "Project Interest" : "Contact Form";
  const projectDetails =
    payload.source === "project_interest" && payload.projectTitle
      ? `<p><strong>Project:</strong> ${escapeHtml(payload.projectTitle)}</p>`
      : "";

  const { error } = await resend.emails.send({
    from: `Devoria <${fromEmail}>`,
    to: recipients,
    replyTo: payload.email,
    subject: `[Devoria] ${payload.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="margin-bottom: 16px;">New ${escapeHtml(sourceLabel)} Message</h2>
        <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(payload.subject)}</p>
        ${projectDetails}
        <p><strong>Message:</strong></p>
        <div style="white-space: pre-wrap; background: #f3f4f6; padding: 16px; border-radius: 8px;">
          ${escapeHtml(payload.message)}
        </div>
      </div>
    `,
  });

  if (error) {
    return {
      sent: false,
      reason: error.message || "Failed to send email via Resend.",
    };
  }

  return { sent: true };
}

export async function POST(request: NextRequest) {
  try {
    const payload = normalizeMessagePayload(await request.json());

    if (!payload) {
      return jsonError(
        "Invalid input. Name, email, subject, and message are required.",
        400
      );
    }

    const db = getFirebaseAdminDb();
    const messageRef = await db.collection("messages").add({
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      message: payload.message,
      source: payload.source ?? "contact",
      projectTitle: payload.projectTitle ?? null,
      projectSlug: payload.projectSlug ?? null,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const emailResult = await sendNotificationEmail(payload);

    if (!emailResult.sent) {
      console.warn("[API] Message saved but email notification failed:", emailResult.reason);
    }

    return NextResponse.json({
      success: true,
      id: messageRef.id,
      emailSent: emailResult.sent,
      warning: emailResult.sent ? undefined : emailResult.reason,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("[API] Message submit failed:", error);
    return jsonError(error.message || "Failed to submit message.", 500);
  }
}
