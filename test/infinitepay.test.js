import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkoutUrlFromResponse,
  createInfinitePayLink,
  infinitePayHandle,
  normalizeBrazilianPhone,
} from '../functions/api/_infinitepay.js';

test('InfinitePay helpers normalize account, phone and documented response shapes', () => {
  assert.equal(infinitePayHandle({ INFINITEPAY_HANDLE: '$maninhocriativos' }), 'maninhocriativos');
  assert.equal(normalizeBrazilianPhone('(92) 99999-0000'), '+5592999990000');
  assert.equal(normalizeBrazilianPhone('+55 92 99999-0000'), '+5592999990000');
  assert.equal(normalizeBrazilianPhone('1234'), '');
  assert.equal(checkoutUrlFromResponse({ checkout_url: 'https://checkout.infinitepay.io/maninhocriativos/abc' }), 'https://checkout.infinitepay.io/maninhocriativos/abc');
  assert.equal(checkoutUrlFromResponse({ link: 'javascript:alert(1)' }), '');
});

test('checkout creation sends cents, customer and system callback URLs', async () => {
  const originalFetch = globalThis.fetch;
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options, body: JSON.parse(options.body) };
    return new Response(JSON.stringify({ checkout_url: 'https://checkout.infinitepay.io/maninhocriativos/teste', slug: 'teste' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };
  try {
    const result = await createInfinitePayLink({
      INFINITEPAY_HANDLE: 'maninhocriativos',
      PUBLIC_BASE_URL: 'https://links.maninhocriativos.com.br',
    }, {
      amountCents: 15990,
      description: 'Criação de site',
      orderNsu: 'maninho-order-1',
      customer: { name: 'Cliente Teste', email: 'cliente@example.com', phone: '92999990000' },
    });
    assert.equal(request.url, 'https://api.checkout.infinitepay.io/links');
    assert.equal(request.body.handle, 'maninhocriativos');
    assert.equal(request.body.items[0].price, 15990);
    assert.equal(request.body.customer.phone_number, '+5592999990000');
    assert.equal(request.body.webhook_url, 'https://links.maninhocriativos.com.br/api/infinitepay/webhook');
    assert.equal(request.body.redirect_url, 'https://links.maninhocriativos.com.br/pagamento-confirmado.html');
    assert.equal(result.paymentUrl, 'https://checkout.infinitepay.io/maninhocriativos/teste');
    assert.equal(result.invoiceSlug, 'teste');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
