import test from 'node:test';
import assert from 'node:assert/strict';
import { parseClientContacts } from '../functions/api/admin/clients.js';

test('client accepts multiple e-mails with one responsible person per address', () => {
  const contacts = parseClientContacts({
    emails: [
      { value: 'FINANCEIRO@EMPRESA.COM.BR', contact_name: 'Andrey' },
      { value: 'diretoria@empresa.com.br', contact_name: 'Beatriz' },
    ],
  }, 'email', 'Empresa');

  assert.deepEqual(contacts, [
    { value: 'financeiro@empresa.com.br', normalized_value: 'financeiro@empresa.com.br', contact_name: 'Andrey' },
    { value: 'diretoria@empresa.com.br', normalized_value: 'diretoria@empresa.com.br', contact_name: 'Beatriz' },
  ]);
});

test('client accepts multiple phone formats and rejects duplicates', () => {
  const contacts = parseClientContacts({
    phones: [
      { value: '(92) 99999-0000', contact_name: 'Andrey' },
      { value: '(92) 98888-0000', contact_name: 'Beatriz' },
    ],
  }, 'phone', 'Empresa');
  assert.equal(contacts[0].normalized_value, '92999990000');
  assert.equal(contacts[1].contact_name, 'Beatriz');

  assert.throws(() => parseClientContacts({
    phones: [
      { value: '(92) 99999-0000', contact_name: 'Andrey' },
      { value: '92 99999 0000', contact_name: 'Outro' },
    ],
  }, 'phone', 'Empresa'), /repetido/);
});

test('every filled client contact requires a responsible person', () => {
  assert.throws(() => parseClientContacts({
    emails: [{ value: 'contato@empresa.com.br', contact_name: '' }],
  }, 'email', 'Empresa'), /obrigat/);
});

test('legacy single contact remains supported', () => {
  assert.deepEqual(parseClientContacts({ email: 'contato@empresa.com.br' }, 'email', 'Empresa'), [
    { value: 'contato@empresa.com.br', normalized_value: 'contato@empresa.com.br', contact_name: 'Empresa' },
  ]);
});
