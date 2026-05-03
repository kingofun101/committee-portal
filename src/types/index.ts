import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      role: "ADMIN" | "MEMBER"
    }
  }
  interface User {
    role: "ADMIN" | "MEMBER"
  }
  interface JWT {
    id: string
    role: "ADMIN" | "MEMBER"
  }
}
