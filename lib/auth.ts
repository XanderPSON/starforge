import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import type { Session } from 'next-auth'
import { getPrisma } from '@/lib/prisma'
import { isAuthEnabled, isDbEnabled } from '@/lib/features'

type AppRole = 'student' | 'admin'

function toRole(value: unknown): AppRole | undefined {
  return value === 'admin' || value === 'student' ? value : undefined
}

function getRoleFromUser(user: unknown): AppRole | undefined {
  if (typeof user !== 'object' || user === null || !('role' in user)) return undefined
  return toRole((user as { role?: unknown }).role)
}

const authEnabled = isAuthEnabled()
const dbEnabled = isDbEnabled()
const prisma = dbEnabled ? getPrisma() : null

const configuredAuth = authEnabled
  ? NextAuth({
      adapter: prisma ? PrismaAdapter(prisma) : undefined,
      session: {
        strategy: prisma ? 'database' : 'jwt',
      },
      providers: [Google],
      callbacks: {
        async signIn({ user, profile }) {
          const profileEmail = profile && typeof profile.email === 'string' ? profile.email : null
          const email = user.email ?? profileEmail
          return email?.toLowerCase().endsWith('@coinbase.com') ?? false
        },
        async jwt({ token, user }) {
          const userRole = getRoleFromUser(user)
          if (userRole) token.role = userRole

          if (prisma && token.sub) {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.sub },
              select: { role: true },
            })
            token.role = dbUser?.role ?? token.role ?? 'student'
            return token
          }

          token.role = token.role ?? 'student'
          return token
        },
        async session({ session, token, user }) {
          if (!session.user) return session

          const userRole = getRoleFromUser(user)
          const roleFromToken = toRole(token.role)
          let resolvedRole: AppRole = userRole ?? roleFromToken ?? 'student'

          if (prisma && token.sub) {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.sub },
              select: { role: true },
            })
            resolvedRole = dbUser?.role ?? resolvedRole
          }

          const userId = token.sub ?? ('id' in user && typeof user.id === 'string' ? user.id : '')
          session.user.id = userId
          session.user.role = resolvedRole

          return session
        },
      },
    })
  : null

const stubHandlers = {
  GET: () => new Response('Auth not configured', { status: 404 }),
  POST: () => new Response('Auth not configured', { status: 404 }),
}

const stubAuth = async (_request?: Request): Promise<Session | null> => null
const stubSignIn = async () => null
const stubSignOut = async () => null

export const handlers = configuredAuth?.handlers ?? stubHandlers
export const auth = configuredAuth?.auth ?? stubAuth
export const signIn = configuredAuth?.signIn ?? stubSignIn
export const signOut = configuredAuth?.signOut ?? stubSignOut
