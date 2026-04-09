import { createToken, authCookieHeader } from '../../../../lib/auth'

export async function POST(request) {
  const { email, password } = await request.json()

  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = createToken(email)

  return Response.json({ success: true, email }, {
    headers: { 'Set-Cookie': authCookieHeader(token) },
  })
}
