import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

// Edge-compatible auth config (no Prisma/Node.js imports)
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  providers: [
    // Credentials provider listed here so Next.js knows about it,
    // but actual authorize() logic lives in auth.ts (Node.js only)
    Credentials({}),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as { role: "ADMIN" | "MEMBER" }).role
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as "ADMIN" | "MEMBER"
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const role = auth?.user?.role
      const { pathname } = nextUrl

      if (
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/contacts") ||
        pathname.startsWith("/admin")
      ) {
        if (!isLoggedIn) return Response.redirect(new URL("/login", nextUrl))
      }

      if (pathname.startsWith("/admin") && role !== "ADMIN") {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }

      if (pathname === "/login" && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }

      return true
    },
  },
  pages: { signIn: "/login" },
}
