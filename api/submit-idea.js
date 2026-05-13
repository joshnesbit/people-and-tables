// Vercel serverless function — POST /api/submit-idea
// Sends form submissions via Resend from notifications@relationaltechproject.org
// to josh@relationaltechproject.org.
//
// Requires the env var RESEND_API_KEY (set in Vercel project settings).

const FROM = 'people and tables <notifications@relationaltechproject.org>';
const TO = 'josh@relationaltechproject.org';

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clean(s, max = 2000) {
  return String(s ?? '').trim().slice(0, max);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY not set');
    return res.status(500).json({ error: 'server not configured' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  // Honeypot: bots fill hidden fields
  if (clean(body.website)) {
    return res.status(200).json({ ok: true });
  }

  const name = clean(body.name, 200);
  const title = clean(body.title, 200);
  const description = clean(body.description, 2000);

  if (!title || !description) {
    return res.status(400).json({ error: 'title and description are required' });
  }

  const fromLabel = name || 'anonymous';
  const subject = `New people + tables idea: ${title}`;

  const text = [
    `New combo submitted via people-and-tables.vercel.app`,
    ``,
    `From: ${fromLabel}`,
    `Name: ${title}`,
    ``,
    `Description:`,
    description,
  ].join('\n');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5; color: #222;">
      <p style="color: #888; margin: 0 0 1rem;">New combo submitted via <a href="https://people-and-tables.vercel.app">people-and-tables.vercel.app</a></p>
      <p><strong>From:</strong> ${escapeHtml(fromLabel)}</p>
      <p><strong>Name:</strong> ${escapeHtml(title)}</p>
      <p><strong>Description:</strong></p>
      <p style="white-space: pre-wrap;">${escapeHtml(description)}</p>
    </div>
  `;

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        subject,
        text,
        html,
        reply_to: undefined,
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      console.error('Resend error', resp.status, detail);
      return res.status(502).json({ error: 'email send failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('submit-idea exception', err);
    return res.status(500).json({ error: 'unexpected error' });
  }
}
