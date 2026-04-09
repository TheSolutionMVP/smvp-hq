import { clearCookieHeader } from '../../../../lib/auth'

export async function POST() {
  return Response.json({ success: true }, {
    headers: { 'Set-Cookie': clearCookieHeader() },
  })
}
