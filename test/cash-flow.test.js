import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCashTransaction } from '../functions/api/admin/cash-flow.js';

function expense(overrides = {}) {
  return {
    type: 'expense', status: 'pending', category: 'Software e assinaturas',
    description: 'Adobe', amount_cents: 5500, due_date: '2026-09-06',
    counterparty_name: 'Adobe', counterparty_document: '', notes: 'Assinatura mensal',
    ...overrides,
  };
}

test('expense stores supplier and never links customer billing data', () => {
  const parsed = parseCashTransaction(expense({ client_id: 4, project_id: 8, payment_url: 'https://example.com/pay' }));
  assert.equal(parsed.counterparty_name, 'Adobe');
  assert.equal(parsed.client_id, null);
  assert.equal(parsed.project_id, null);
  assert.equal(parsed.notes, 'Assinatura mensal');
});

test('expense requires a supplier or beneficiary', () => {
  assert.throws(() => parseCashTransaction(expense({ counterparty_name: '' })), /obrigat/);
});

test('household expense is kept separate from business expenses', () => {
  const parsed = parseCashTransaction(expense({
    expense_scope: 'household',
    category: 'Mercado e feira',
    description: 'Compras da semana',
    counterparty_name: 'Supermercado',
  }));
  assert.equal(parsed.expense_scope, 'household');
});

test('income can never be stored as a household transaction', () => {
  const parsed = parseCashTransaction({
    ...expense({ type: 'income', counterparty_name: '', expense_scope: 'household' }),
  });
  assert.equal(parsed.expense_scope, 'business');
});
