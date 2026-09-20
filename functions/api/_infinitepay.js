import { HttpError } from './_utils.js';

const CHECKOUT_API = 'https://api.checkout.infinitepay.io';
const MAX_PROVIDER_RESPONSE_BYTES = 65_536;

async function readLimitedJson(response) {
  if (!response.body) return {};
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_PROVIDER_RESPONSE_BYTES) {
      await reader.cancel();
      throw new HttpError(502, 'Resposta muito grande recebida da InfinitePay');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new HttpError(502, 'Resposta inválida recebida da InfinitePay');
  }
}

function providerMessage(data, fallback) {
  const message = data?.message || data?.error || data?.detail;
  return typeof message === 'string' && message.trim() ? message.trim().slice(0, 240) : fallback;
}

export function infinitePayHandle(env) {
  return String(env?.INFINITEPAY_HANDLE || 'maninhocriativos').trim().replace(/^\$/, '');
}

export function normalizeBrazilianPhone(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  return digits.length === 12 || digits.length === 13 ? `+${digits}` : '';
}

export function checkoutUrlFromResponse(data) {
  const candidates = [
    data?.checkout_url,
    data?.link,
    data?.url,
    data?.payment_url,
    data?.data?.checkout_url,
    data?.data?.link,
    data?.data?.url,
  ];
  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue;
    try {
      const url = new URL(candidate);
      if (url.protocol === 'https:') return url.href;
    } catch {
      // Try the next documented response shape.
    }
  }
  return '';
}

export function makeInfinitePayOrderNsu() {
  return `maninho-${crypto.randomUUID()}`;
}

export async function createInfinitePayLink(env, {
  amountCents,
  description,
  orderNsu,
  customer,
}) {
  const baseUrl = String(env?.PUBLIC_BASE_URL || 'https://links.maninhocriativos.com.br').replace(/\/$/, '');
  const payload = {
    handle: infinitePayHandle(env),
    order_nsu: orderNsu,
    redirect_url: `${baseUrl}/pagamento-confirmado.html`,
    webhook_url: `${baseUrl}/api/infinitepay/webhook`,
    items: [{ quantity: 1, price: amountCents, description }],
  };
  if (customer?.name) {
    payload.customer = {
      name: customer.name,
      ...(customer.email ? { email: customer.email } : {}),
      ...(normalizeBrazilianPhone(customer.phone) ? { phone_number: normalizeBrazilianPhone(customer.phone) } : {}),
    };
  }

  let response;
  try {
    response = await fetch(`${CHECKOUT_API}/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new HttpError(502, 'Não foi possível conectar à InfinitePay');
  }
  const data = await readLimitedJson(response);
  if (!response.ok || data?.success === false) {
    throw new HttpError(502, providerMessage(data, 'A InfinitePay recusou a criação do link'));
  }
  const paymentUrl = checkoutUrlFromResponse(data);
  if (!paymentUrl) throw new HttpError(502, 'A InfinitePay não retornou um link de pagamento');
  return { paymentUrl, invoiceSlug: String(data?.slug || data?.invoice_slug || data?.data?.slug || '') };
}

export async function checkInfinitePayPayment(env, { orderNsu, transactionNsu, slug }) {
  let response;
  try {
    response = await fetch(`${CHECKOUT_API}/payment_check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        handle: infinitePayHandle(env),
        order_nsu: orderNsu,
        transaction_nsu: transactionNsu,
        slug,
      }),
    });
  } catch {
    throw new Error('Não foi possível consultar a InfinitePay');
  }
  const data = await readLimitedJson(response);
  if (!response.ok || data?.success === false) {
    throw new Error(providerMessage(data, 'Falha ao confirmar o pagamento na InfinitePay'));
  }
  return data;
}
