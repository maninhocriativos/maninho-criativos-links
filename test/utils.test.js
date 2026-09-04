import test from 'node:test';
import assert from 'node:assert/strict';
import { HttpError, color, httpUrl, integer, text } from '../functions/api/_utils.js';

test('text trims and enforces limits', () => {
  assert.equal(text('  Maninho  ', { required: true, max: 20 }), 'Maninho');
  assert.throws(() => text('<'.repeat(101), { max: 100 }), HttpError);
});

test('URLs only accept HTTP protocols', () => {
  assert.equal(httpUrl('https://example.com'), 'https://example.com');
  assert.throws(() => httpUrl('javascript:alert(1)'), HttpError);
});

test('colors and integers reject malformed values', () => {
  assert.equal(color('#00d4ff'), '#00d4ff');
  assert.throws(() => color('red'), HttpError);
  assert.equal(integer('5', { min: 0, max: 10 }), 5);
  assert.throws(() => integer('1.2'), HttpError);
});
