import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    role: string;
    policeStation?: string;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      policeStation?: string;
      name?: string | null;
      email?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: string;
    policeStation?: string;
  }
}
