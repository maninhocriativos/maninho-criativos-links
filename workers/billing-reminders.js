const SLOT_LABELS = Object.freeze({ 1: '09h', 2: '13h', 3: '17h' });
const CRON_SLOTS = Object.freeze({
  '0 13 * * *': 1,
  '0 17 * * *': 2,
  '0 21 * * *': 3,
});

export function slotForCron(cron) {
  return CRON_SLOTS[cron] || 0;
}

export function dateInManaus(timestamp) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Manaus', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(timestamp));
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function addCalendarDays(dateString, days) {
  const [year, month, day] = dateString.split('-').map(Number);
  const target = new Date(Date.UTC(year, month - 1, day + days));
  return target.toISOString().slice(0, 10);
}

export function normalizeBrazilPhone(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  return digits.length === 12 || digits.length === 13 ? `+${digits}` : '';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function money(cents) {
  return (Number(cents || 0) / 100).toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL',
  });
}

export function buildReminderContent(item, slot) {
  const amount = money(item.amount_cents);
  const clientName = item.client_name || 'cliente';
  const subjects = {
    1: `Lembrete: seu pagamento vence hoje — ${item.description}`,
    2: `Pagamento com vencimento hoje — ${item.description}`,
    3: `Último lembrete de hoje — ${item.description}`,
  };
  const text = `Olá, ${clientName}. Este é um lembrete da Maninho Criativos sobre o pagamento de ${item.description}, no valor de ${amount}, com vencimento hoje. Link para pagamento: ${item.payment_url}. Em caso de dúvida, responda este e-mail.`;
  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f3f6fa;font-family:Arial,sans-serif;color:#172033">
    <div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #e5eaf0;border-radius:16px;overflow:hidden">
      <div style="background:#0b1220;color:#fff;padding:28px 32px"><div style="color:#60a5fa;font-size:12px;font-weight:700;letter-spacing:1.8px">MANINHO CRIATIVOS</div><h1 style="font-size:23px;margin:8px 0 0">Lembrete de pagamento</h1></div>
      <div style="padding:30px 32px"><p>Olá, <strong>${escapeHtml(clientName)}</strong>.</p><p>Seu pagamento vence hoje:</p>
        <div style="background:#f8fafc;border-radius:12px;padding:18px 20px;margin:22px 0"><div style="font-size:13px;color:#64748b">${escapeHtml(item.description)}</div><div style="font-size:26px;font-weight:800;margin-top:6px">${escapeHtml(amount)}</div></div>
        <a href="${escapeHtml(item.payment_url)}" style="display:block;background:#1677ff;color:#fff;text-decoration:none;text-align:center;font-weight:700;padding:15px 20px;border-radius:10px">Pagar agora</a>
        <p style="font-size:12px;color:#64748b;margin-top:22px">Se você já realizou o pagamento, desconsidere esta mensagem. Em caso de dúvida, responda este e-mail.</p>
      </div>
    </div></body></html>`;
  return { subject: subjects[slot] || subjects[1], text, html, amount, clientName };
}

function dateLabel(dateString) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${dateString}T12:00:00Z`));
}

export function buildFinanceAlertContent(items, dueDate) {
  const income = items.filter(item => item.type === 'income');
  const expenses = items.filter(item => item.type === 'expense');
  const incomeTotal = income.reduce((sum, item) => sum + Number(item.amount_cents || 0), 0);
  const expenseTotal = expenses.reduce((sum, item) => sum + Number(item.amount_cents || 0), 0);
  const rows = items.map(item => {
    const isExpense = item.type === 'expense';
    const party = isExpense ? (item.counterparty_name || 'Fornecedor não informado') : (item.client_name || 'Cliente não informado');
    const color = isExpense ? '#dc2626' : '#15803d';
    return `<tr><td style="padding:12px;border-bottom:1px solid #e5e7eb"><strong>${isExpense ? 'A pagar' : 'A receber'}</strong><br><span style="color:#64748b;font-size:12px">${escapeHtml(party)}</span></td><td style="padding:12px;border-bottom:1px solid #e5e7eb">${escapeHtml(item.description)}</td><td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:right;color:${color};font-weight:700;white-space:nowrap">${escapeHtml(money(item.amount_cents))}</td></tr>`;
  }).join('');
  const summary = [
    income.length ? `${income.length} recebimento(s), total de ${money(incomeTotal)}` : '',
    expenses.length ? `${expenses.length} despesa(s), total de ${money(expenseTotal)}` : '',
  ].filter(Boolean).join('; ');
  const subject = `Vencimentos em 3 dias — ${dateLabel(dueDate)}`;
  const text = `Maninho Criativos — vencimentos em 3 dias (${dateLabel(dueDate)}): ${summary}.\n\n${items.map(item => `${item.type === 'expense' ? 'A pagar' : 'A receber'}: ${item.description} — ${money(item.amount_cents)} — ${item.type === 'expense' ? item.counterparty_name || 'Fornecedor não informado' : item.client_name || 'Cliente não informado'}`).join('\n')}`;
  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f3f6fa;font-family:Arial,sans-serif;color:#172033">
    <div style="max-width:680px;margin:32px auto;background:#fff;border:1px solid #e5eaf0;border-radius:16px;overflow:hidden">
      <div style="background:#0b1220;color:#fff;padding:28px 32px"><div style="color:#60a5fa;font-size:12px;font-weight:700;letter-spacing:1.8px">MANINHO CRIATIVOS</div><h1 style="font-size:23px;margin:8px 0 0">Agenda financeira</h1><p style="color:#cbd5e1;margin:8px 0 0">Vencimentos de ${escapeHtml(dateLabel(dueDate))}</p></div>
      <div style="padding:26px 32px"><p style="margin-top:0">Faltam <strong>3 dias</strong>. Confira os valores programados:</p><table style="width:100%;border-collapse:collapse;margin:20px 0">${rows}</table>
        <div style="background:#f8fafc;border-radius:10px;padding:14px 16px;color:#475569;font-size:13px">${escapeHtml(summary)}</div>
        ${envDashboardLink('')}
      </div>
    </div></body></html>`;
  return { subject, text, html, summary };
}

function envDashboardLink(url) {
  if (!url) return '';
  return `<a href="${escapeHtml(url)}" style="display:block;margin-top:20px;background:#1677ff;color:#fff;text-decoration:none;text-align:center;font-weight:700;padding:14px 18px;border-radius:10px">Abrir financeiro</a>`;
}

async function claimDelivery(env, transactionId, channel, slot) {
  const result = await env.DB.prepare(`INSERT OR IGNORE INTO billing_reminder_deliveries
    (transaction_id, channel, slot, status) VALUES (?, ?, ?, 'processing')`)
    .bind(transactionId, channel, slot).run();
  return Number(result.meta?.changes || 0) === 1;
}

async function markDelivery(env, transactionId, channel, slot, status, providerId = '', providerError = '') {
  await env.DB.prepare(`UPDATE billing_reminder_deliveries
    SET status=?, provider_id=?, provider_error=?, sent_at=CASE WHEN ?='sent' THEN datetime('now') ELSE sent_at END,
        updated_at=datetime('now') WHERE transaction_id=? AND channel=? AND slot=?`)
    .bind(status, providerId, providerError.slice(0, 500), status, transactionId, channel, slot).run();
}

async function sendEmail(env, item, slot) {
  const content = buildReminderContent(item, slot);
  const response = await env.EMAIL.send({
    to: item.client_email,
    from: env.BILLING_FROM_EMAIL,
    subject: content.subject,
    html: content.html,
    text: content.text,
  });
  return response?.messageId || '';
}

async function sendTwilioMessage(env, parameters) {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
    throw new Error('Credenciais Twilio não configuradas');
  }
  const body = new URLSearchParams(parameters);
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(env.TWILIO_ACCOUNT_SID)}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.sid) throw new Error(result.message || `Twilio respondeu ${response.status}`);
  return result.sid;
}

async function sendSms(env, item, slot) {
  if (!env.TWILIO_SMS_FROM) throw new Error('Número de SMS da Twilio não configurado');
  const to = normalizeBrazilPhone(item.client_phone);
  if (!to) throw new Error('Telefone do cliente inválido para SMS');
  const content = buildReminderContent(item, slot);
  return sendTwilioMessage(env, {
    To: to,
    From: env.TWILIO_SMS_FROM,
    Body: `Maninho Criativos: ${item.description}, ${content.amount}, vence hoje. Pague aqui: ${item.payment_url}. Se já pagou, desconsidere.`,
  });
}

async function sendWhatsapp(env, item, slot) {
  if (!env.ZAPI_INSTANCE_ID || !env.ZAPI_INSTANCE_TOKEN || !env.ZAPI_CLIENT_TOKEN) {
    throw new Error('Credenciais Z-API não configuradas');
  }
  const to = normalizeBrazilPhone(item.client_phone);
  if (!to) throw new Error('Telefone do cliente inválido para WhatsApp');
  const content = buildReminderContent(item, slot);
  const response = await fetch(`https://api.z-api.io/instances/${encodeURIComponent(env.ZAPI_INSTANCE_ID)}/token/${encodeURIComponent(env.ZAPI_INSTANCE_TOKEN)}/send-text`, {
    method: 'POST',
    headers: {
      'Client-Token': env.ZAPI_CLIENT_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone: to.slice(1),
      message: `Olá, ${content.clientName}. Seu pagamento de ${item.description}, no valor de ${content.amount}, vence hoje.\n\nPague pelo link: ${item.payment_url}\n\nSe já realizou o pagamento, desconsidere esta mensagem. — Maninho Criativos`,
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || (!result.messageId && !result.id)) {
    throw new Error(result.error || result.message || `Z-API respondeu ${response.status}`);
  }
  return result.messageId || result.id;
}

const CHANNELS = Object.freeze([
  { name: 'email', flag: 'reminder_email', destination: 'client_email', send: sendEmail },
  { name: 'sms', flag: 'reminder_sms', destination: 'client_phone', send: sendSms },
  { name: 'whatsapp', flag: 'reminder_whatsapp', destination: 'client_phone', send: sendWhatsapp },
]);

export async function processBillingReminders(env, { timestamp, cron }) {
  const slot = slotForCron(cron);
  if (!slot) throw new Error(`Cron de cobrança desconhecido: ${cron}`);
  const dueDate = dateInManaus(timestamp);
  const { results = [] } = await env.DB.prepare(`SELECT t.*, c.name client_name, c.email client_email, c.phone client_phone
    FROM cash_transactions t JOIN clients c ON c.id=t.client_id
    WHERE t.due_date=? AND t.type='income' AND t.status='pending' AND t.reminder_enabled=1
      AND length(trim(t.payment_url)) > 0 AND c.is_active=1 ORDER BY t.id`).bind(dueDate).all();
  let sent = 0;
  let failed = 0;
  for (const item of results) {
    for (const channel of CHANNELS) {
      if (!item[channel.flag] || !item[channel.destination]) continue;
      if (!await claimDelivery(env, item.id, channel.name, slot)) continue;
      try {
        const providerId = await channel.send(env, item, slot);
        await markDelivery(env, item.id, channel.name, slot, 'sent', providerId);
        sent += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await markDelivery(env, item.id, channel.name, slot, 'failed', '', message);
        failed += 1;
        console.error(JSON.stringify({ message: 'billing reminder failed', transactionId: item.id, channel: channel.name, slot, error: message }));
      }
    }
  }
  console.log(JSON.stringify({ message: 'billing reminders processed', dueDate, slot, transactions: results.length, sent, failed }));
  return { dueDate, slot, transactions: results.length, sent, failed };
}

export default {
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(processBillingReminders(env, {
      timestamp: controller.scheduledTime,
      cron: controller.cron,
    }));
  },
};
