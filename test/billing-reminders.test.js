import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildReminderContent,
  dateInManaus,
  normalizeBrazilPhone,
  processBillingReminders,
  slotForCron,
} from '../workers/billing-reminders.js';

test('billing cron slots match 09h, 13h and 17h in Manaus', () => {
  assert.equal(slotForCron('0 13 * * *'), 1);
  assert.equal(slotForCron('0 17 * * *'), 2);
  assert.equal(slotForCron('0 21 * * *'), 3);
  assert.equal(dateInManaus(Date.parse('2026-09-06T02:30:00Z')), '2026-09-05');
});

test('Brazil phone normalization accepts local and international values', () => {
  assert.equal(normalizeBrazilPhone('(92) 98609-6874'), '+5592986096874');
  assert.equal(normalizeBrazilPhone('+55 92 98609-6874'), '+5592986096874');
  assert.equal(normalizeBrazilPhone('123'), '');
});

test('billing email includes escaped customer data and payment link', () => {
  const content = buildReminderContent({
    client_name: 'Cliente <Teste>',
    description: 'Website',
    amount_cents: 250000,
    payment_url: 'https://example.com/pay?id=1&source=test',
  }, 1);
  assert.match(content.subject, /vence hoje/);
  assert.match(content.html, /Cliente &lt;Teste&gt;/);
  assert.match(content.html, /https:\/\/example\.com\/pay\?id=1&amp;source=test/);
  assert.match(content.text, /R\$\s*2\.500,00/);
});

test('scheduled billing sends one Cloudflare email for an enabled charge', async () => {
  const statements = [];
  const sent = [];
  const item = {
    id: 42,
    client_name: 'Maria',
    client_email: 'maria@example.com',
    client_phone: '',
    description: 'Identidade visual',
    amount_cents: 80000,
    payment_url: 'https://example.com/pay/42',
    reminder_email: 1,
    reminder_sms: 0,
    reminder_whatsapp: 0,
  };
  const env = {
    BILLING_FROM_EMAIL: 'contato@maninhocriativos.com.br',
    EMAIL: { async send(payload) { sent.push(payload); return { messageId: 'email-1' }; } },
    DB: {
      prepare(sql) {
        return {
          bind(...values) {
            statements.push({ sql, values });
            return {
              async all() { return { results: [item] }; },
              async run() { return { meta: { changes: 1 } }; },
            };
          },
        };
      },
    },
  };
  const result = await processBillingReminders(env, {
    timestamp: Date.parse('2026-09-05T13:00:00Z'),
    cron: '0 13 * * *',
  });
  assert.equal(result.sent, 1);
  assert.equal(result.failed, 0);
  assert.equal(sent[0].to, 'maria@example.com');
  assert.equal(sent[0].from, 'contato@maninhocriativos.com.br');
  assert.ok(statements.some(entry => entry.sql.includes('INSERT OR IGNORE')));
});
