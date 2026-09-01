import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

// TODO: replace with the real JVS Painting inbox before launch — this address
// is a placeholder. Set BID_INBOX in the environment to override without a
// code change.
const BID_INBOX = process.env.BID_INBOX ?? "bids@jvspainting.com";

// Resend only delivers from a domain verified in the account. Until
// jvspainting.com is verified, its own onboarding sender is used.
const FROM_ADDRESS =
  process.env.BID_FROM ?? "JVS Painting Website <onboarding@resend.dev>";

type BidPayload = {
  name?: string;
  organization?: string;
  email?: string;
  phone?: string;
  projectType?: string;
  location?: string;
  timeline?: string;
  details?: string;
};

const REQUIRED_FIELDS: (keyof BidPayload)[] = [
  "name",
  "email",
  "phone",
  "projectType",
  "location",
  "details",
];

const clean = (value: unknown) =>
  typeof value === "string" ? value.trim().slice(0, 5000) : "";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export async function POST(request: Request) {
  let body: BidPayload;

  try {
    body = (await request.json()) as BidPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const payload: Required<BidPayload> = {
    name: clean(body.name),
    organization: clean(body.organization),
    email: clean(body.email),
    phone: clean(body.phone),
    projectType: clean(body.projectType),
    location: clean(body.location),
    timeline: clean(body.timeline),
    details: clean(body.details),
  };

  const missing = REQUIRED_FIELDS.filter((field) => !payload[field]);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required field(s): ${missing.join(", ")}.` },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set — bid request was not delivered.");
    return NextResponse.json(
      { error: "Email delivery is not configured on the server." },
      { status: 500 }
    );
  }

  const rows: [string, string][] = [
    ["Name", payload.name],
    ["Organization / Agency", payload.organization || "—"],
    ["Email", payload.email],
    ["Phone", payload.phone],
    ["Project Type", payload.projectType],
    ["Project Location", payload.location],
    ["Estimated Timeline", payload.timeline || "—"],
  ];

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#1F295D;max-width:640px">
      <h2 style="font-family:Georgia,'Times New Roman',serif;color:#1F295D;margin:0 0 4px">
        New Bid Request
      </h2>
      <p style="color:#4A5568;margin:0 0 24px;font-size:14px">
        Submitted through jvspainting.com
      </p>
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px">
        ${rows
          .map(
            ([label, value]) => `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #E2E5EA;color:#4A5568;width:40%">${escapeHtml(
              label
            )}</td>
            <td style="padding:10px 0;border-bottom:1px solid #E2E5EA;color:#1F295D;font-weight:bold">${escapeHtml(
              value
            )}</td>
          </tr>`
          )
          .join("")}
      </table>
      <h3 style="font-family:Georgia,'Times New Roman',serif;margin:28px 0 8px">Project Details</h3>
      <p style="color:#4A5568;font-size:14px;line-height:1.7;white-space:pre-wrap;margin:0">${escapeHtml(
        payload.details
      )}</p>
    </div>
  `;

  const text = [
    "New Bid Request — submitted through jvspainting.com",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Project Details:",
    payload.details,
  ].join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [BID_INBOX],
      replyTo: payload.email,
      subject: `Bid Request — ${payload.projectType} — ${payload.name}`,
      html,
      text,
    });

    if (error) {
      console.error("Resend rejected the bid request:", error);
      return NextResponse.json(
        { error: "We couldn't send your request. Please call us instead." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Unexpected error sending bid request:", err);
    return NextResponse.json(
      { error: "We couldn't send your request. Please call us instead." },
      { status: 500 }
    );
  }
}
