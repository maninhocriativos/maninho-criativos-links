import { errorResponse, json, rateLimit, readJson, text } from '../_utils.js';
import { hashToken } from './_auth.js';

async function sameHash(a, b) {
  const enc = new TextEncoder();
  const [left, right] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a || '')),
    crypto.subtle.digest('SHA-256', enc.encode(b || '')),
  ]);
  const lv = new Uint8Array(left), rv = new Uint8Array(right);
  let result = 0;
  for (let i = 0; i < lv.length; i++) result |= lv[i] ^ rv[i];
  return result === 0 && Boolean(a) && Boolean(b);
}

function createCode() {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return String(values[0] % 1_000_000).padStart(6, '0');
}

function emailHtml(code) {
  return `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;color:#111">
    <h1 style="font-size:22px">Confirmação de acesso</h1>
    <p>Use o código abaixo para acessar o painel Maninho Criativos:</p>
    <p style="font-size:34px;font-weight:700;letter-spacing:8px;margin:28px 0">${code}</p>
    <p>O código expira em 10 minutos. Se você não tentou entrar, ignore este e-mail.</p>
  </div>`;
}

export async function onRequestPost({ request, env }) {
  try {
    await rateLimit(env, request, 'admin-login', 8, 15 * 60);
    const body = await readJson(request, 2_048);
    const email = text(body.email, { required: true, max: 254 }).toLowerCase();
    const password = text(body.password, { required: true, max: 256 });
    const validEmail = (env.ADMIN_EMAIL || '').trim().toLowerCase();
    if (!env.ADMIN_PASSWORD || !validEmail || !env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL ||
        !await sameHash(email, validEmail) || !await sameHash(password, env.ADMIN_PASSWORD)) {
      return json({ error: 'E-mail ou senha incorretos' }, 401);
    }

    const challengeId = crypto.randomUUID();
    const code = createCode();
    const codeHash = await hashToken(`${challengeId}:${code}:${env.ADMIN_PASSWORD}`);
    await env.DB.batch([
      env.DB.prepare(`DELETE FROM admin_login_challenges WHERE expires_at <= datetime('now') OR email = ?`).bind(email),
      env.DB.prepare(
        `INSERT INTO admin_login_challenges (id, email, code_hash, expires_at) VALUES (?, ?, ?, datetime('now', '+10 minutes'))`
      ).bind(challengeId, email, codeHash),
    ]);

    const sent = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': challengeId,
      },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL,
        to: [validEmail],
        subject: 'Código de acesso — Maninho Criativos',
        html: emailHtml(code),
        text: `Seu código de acesso é ${code}. Ele expira em 10 minutos.`,
      }),
    });
    if (!sent.ok) {
      await env.DB.prepare(`DELETE FROM admin_login_challenges WHERE id = ?`).bind(challengeId).run();
      console.error(JSON.stringify({ level: 'error', route: 'admin-login', provider: 'resend', status: sent.status }));
      return json({ error: 'Não foi possível enviar o código de acesso' }, 502);
    }
    return json({ requires_verification: true, challenge_id: challengeId });
  } catch (error) { return errorResponse(error); }
}
