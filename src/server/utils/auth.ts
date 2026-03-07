import jwt from 'jsonwebtoken';
import { compareSync } from 'bcryptjs';
import type { H3Event } from 'h3';
import { getCookie, setCookie, deleteCookie } from 'h3';

const JWT_SECRET = process.env['JWT_SECRET'] || 'fallback-dev-secret';
const TOKEN_NAME = 'adminpro_token';
const EXPIRES_IN = '24h';

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export function createToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function setAuthCookie(event: H3Event, token: string) {
  setCookie(event, TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });
}

export function clearAuthCookie(event: H3Event) {
  deleteCookie(event, TOKEN_NAME, { path: '/' });
}

export function getAuthFromEvent(event: H3Event): JwtPayload | null {
  const token = getCookie(event, TOKEN_NAME);
  if (!token) return null;
  return verifyToken(token);
}

export function verifyPassword(plain: string, hash: string): boolean {
  return compareSync(plain, hash);
}
