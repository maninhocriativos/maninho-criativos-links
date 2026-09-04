import { errorResponse, HttpError, json, rateLimit } from '../../_utils.js';
import { requireAuth } from '../_auth.js';

export async function onRequestGet({ request, env, params }) {
  try {
    const denied = await requireAuth(request, env); if (denied) return denied;
    await rateLimit(env, request, 'admin-cep', 120, 60 * 60);
    const cep = String(params.cep || '').replace(/\D/g, '');
    if (!/^\d{8}$/.test(cep)) throw new HttpError(400, 'CEP deve possuir 8 dígitos');

    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      headers: { Accept: 'application/json', 'User-Agent': 'Maninho-Criativos/1.0' },
      cf: { cacheTtl: 86_400, cacheEverything: true },
    });
    if (!response.ok) throw new HttpError(502, 'Serviço de CEP indisponível');
    const data = await response.json();
    if (data.erro) throw new HttpError(404, 'CEP não encontrado');
    return json({
      cep: data.cep || cep,
      address: [data.logradouro, data.complemento].filter(Boolean).join(', '),
      neighborhood: data.bairro || '', city: data.localidade || '', state: data.uf || '',
    }, 200, { 'Cache-Control': 'private, max-age=86400' });
  } catch (error) { return errorResponse(error); }
}
