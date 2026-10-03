import { errorResponse, HttpError, json, rateLimit, readJson, text } from '../_utils.js';
import { hashPassword, hashToken } from './_auth.js';

function validEmail(value) {
  const email = text(value, { required: true, max: 254 }).toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(400, 'E-mail inválido');
  return email;
}

function createCode() {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return String(values[0] % 1_000_000).padStart(6, '0');
}

function emailHtml(code) {
  return `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;color:#111">
    <h1 style="font-size:22px">Confirme seu cadastro</h1>
    <p>Use o código abaixo para confirmar seu acesso ao painel Maninho Criativos:</p>
    <p style="font-size:34px;font-weight:700;letter-spacing:8px;margin:28px 0">${code}</p>
    <p>O código expira em 10 minutos. Depois da confirmação, o proprietário precisa aprovar seu acesso.</p>
  </div>`;
}

export async function onRequestPost({ request, env }) {
  try {
    await rateLimit(env, request, 'admin-registration', 5, 60 * 60);
    if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) throw new HttpError(503, 'Cadastro temporariamente indisponível');
    const body = await readJson(request, 4_096);
    const name = text(body.name, { required: true, max: 120 });
    const email = validEmail(body.email);
    const password = text(body.password, { required: true, min: 8, max: 256 });
    if (password !== text(body.password_confirmation, { required: true, min: 8, max: 256 })) throw new HttpError(400, 'As senhas não conferem');
    if (email === (env.ADMIN_EMAIL || '').trim().toLowerCase()) throw new HttpError(409, 'Este e-mail já possui acesso');
    const existing = await env.DB.prepare(`SELECT id FROM admin_users WHERE lower(email)=?`).bind(email).first();
    if (existing) throw new HttpError(409, 'Este e-mail já possui cadastro ou está aguardando aprovação');

    const passwordHash = await hashPassword(password);
    const created = await env.DB.prepare(`INSERT INTO admin_users (name,email,password_hash,role,status) VALUES (?,?,?,'admin','pending') RETURNING id`)
      .bind(name, email, passwordHash).first();
    const challengeId = crypto.randomUUID();
    const code = createCode();
    await env.DB.prepare(`INSERT INTO admin_login_challenges (id,email,code_hash,expires_at,user_id,purpose) VALUES (?,?,?,datetime('now','+10 minutes'),?,'registration')`)
      .bind(challengeId, email, await hashToken(`${challengeId}:${code}:${passwordHash}`), created.id).run();

    const sent = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': challengeId },
      body: JSON.stringify({ from: env.RESEND_FROM_EMAIL, to: [email], subject: 'Confirme seu cadastro — Maninho Criativos', html: emailHtml(code), text: `Seu código de cadastro é ${code}. Ele expira em 10 minutos.` }),
    });
    if (!sent.ok) {
      await env.DB.batch([
        env.DB.prepare(`DELETE FROM admin_login_challenges WHERE id=?`).bind(challengeId),
        env.DB.prepare(`DELETE FROM admin_users WHERE id=?`).bind(created.id),
      ]);
      throw new HttpError(502, 'Não foi possível enviar o código de cadastro');
    }
    return json({ requires_verification: true, challenge_id: challengeId }, 201);
  } catch (error) { return errorResponse(error); }
}
