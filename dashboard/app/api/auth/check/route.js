import { requireAdmin } from '../../../../lib/auth'

export async function GET(request) {
  const admin = requireAdmin(request)
  return Response.json({ authenticated: !!admin, email: admin?.email || null })
}
