// POST /api/admin/login
export async function onRequestPost({ request, env }) {
  try {
    const { password } = await request.json();
    if (!password) return Response.json({ error: 'Missing password' }, { status: 400 });

    if (password !== env.ADMIN_PASSWORD) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return Response.json({ token: env.ADMIN_TOKEN });
  } catch (e) {
    return Response.json({ error: 'Bad request' }, { status: 400 });
  }
}
