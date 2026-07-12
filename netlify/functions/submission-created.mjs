// Runs automatically whenever a Netlify Forms submission is verified
// (the function name "submission-created" is a Netlify event trigger).
// Emails the inquiry to the address Josh sets in the site admin
// (Site Settings > Inquiry notification email), via Resend.
//
// site.json is inlined at deploy time; a CMS edit commits + redeploys,
// so the recipient here always matches the admin panel.
//
// Requires RESEND_API_KEY env var (see DEPLOY.md). If it's missing the
// submission is still stored in the Netlify dashboard — nothing is lost.
import site from "../../src/_data/site.json";

const FIELD_LABELS = {
  name: "Name",
  company: "Company",
  email: "Work email",
  phone: "Phone",
  industry: "Industry",
  "company-size": "Company size",
  message: "Message",
  "security-assessment": "Wants security assessment",
};

export const handler = async (event) => {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY not set — inquiry stored in Netlify Forms dashboard only.");
    return { statusCode: 200, body: "no mailer configured" };
  }

  const { payload } = JSON.parse(event.body);
  const data = payload?.data || {};
  const to = site.inquiryEmail || site.contact.email;

  const lines = Object.entries(FIELD_LABELS)
    .filter(([field]) => data[field])
    .map(([field, label]) => `${label}: ${data[field]}`);
  lines.push("", `Submitted: ${payload?.created_at || new Date().toISOString()}`);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.INQUIRY_FROM || "IronGate Website <inquiries@igm-it.com>",
      to: [to],
      reply_to: data.email || undefined,
      subject: `New consult inquiry — ${data.name || "unknown"}${data.company ? ` (${data.company})` : ""}`,
      text: lines.join("\n"),
    }),
  });

  if (!res.ok) {
    console.error(`Resend error ${res.status}: ${await res.text()}`);
    return { statusCode: 502, body: "mail send failed (submission is stored in Netlify Forms)" };
  }

  console.log(`Inquiry forwarded to ${to}`);
  return { statusCode: 200, body: "ok" };
};
