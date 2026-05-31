// POST /api/admin/login
export async function onRequestPost({ request, env }) {
  try {
    const { username, password } = await request.json();
    if (!password) return Response.json({ error: 'Credenciais obrigatórias' }, { status: 400 });

    const validUser = env.ADMIN_USER || 'admin';
    const validPass = env.ADMIN_PASSWORD;

    if (!validPass || password !== validPass) {
      return Response.json({ error: 'Usuário ou senha incorretos' }, { status: 401 });
    }

    if (username && username !== validUser) {
      return Response.json({ error: 'Usuário ou senha incorretos' }, { status: 401 });
    }

    return Response.json({ token: env.ADMIN_TOKEN });
  } catch {
    return Response.json({ error: 'Requisição inválida' }, { status: 400 });
  }
}
