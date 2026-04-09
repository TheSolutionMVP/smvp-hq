import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET
const COOKIE_NAME = 'admin_token'
const TOKEN_EXPIRY = '24h'

export function createToken(email) {
  return jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (decoded.email !== process.env.ADMIN_EMAIL) return null
    return decoded
  } catch {
    return null
  }
}

// Parse cookie from raw header string (works for Pages Router req and App Router request)
export function getTokenFromCookies(reqOrRequest) {
  // App Router: request.cookies.get()
  if (reqOrRequest?.cookies?.get) {
    const cookie = reqOrRequest.cookies.get(COOKIE_NAME)
    return cookie?.value || null
  }
  // Pages Router or raw header
  const cookies = reqOrRequest?.headers?.cookie || reqOrRequest?.headers?.get?.('cookie') || ''
  const match = cookies.split(';').find(c => c.trim().startsWith(COOKIE_NAME + '='))
  return match ? match.split('=')[1].trim() : null
}

// App Router: returns Set-Cookie header value
export function authCookieHeader(token) {
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : ''
  return `${COOKIE_NAME}=${token}; HttpOnly;${secure} SameSite=Strict; Path=/; Max-Age=86400`
}

export function clearCookieHeader() {
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : ''
  return `${COOKIE_NAME}=; HttpOnly;${secure} SameSite=Strict; Path=/; Max-Age=0`
}

// Guard for App Router API routes
export function requireAdmin(request) {
  const token = getTokenFromCookies(request)
  if (!token) return null
  return verifyToken(token)
}
