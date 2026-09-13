import { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

import { connectDB } from "@/lib/db"
import { User } from "@/models/User"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing username or password")
        }

        await connectDB()

        const user = await User.findOne({
          username: credentials.username.toLowerCase(),
        })

        if (!user) {
          throw new Error("Invalid username or password")
        }

        if (user.status !== "ACTIVE") {
          throw new Error("Account suspended")
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isValid) {
          throw new Error("Invalid username or password")
        }

        return {
          id: user._id.toString(),
          username: user.username,
          role: user.role,
          name: user.fullName,
          email: user.email,
          policeStation: user.policeStation?.toString(),
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.username = user.username
        token.id = user.id
        token.policeStation = user.policeStation
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.username = token.username as string
        session.user.id = token.id as string
        session.user.policeStation = token.policeStation as string
      }
      return session
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
}
