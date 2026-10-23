import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { upsertUser, getUserByEmail } from "@/lib/user-store";

const isGoogleConfigured =
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_ID !== "your-google-client-id" &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_SECRET !== "your-google-client-secret";

export const authOptions: NextAuthOptions = {
  providers: [
    ...(isGoogleConfigured
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
              params: {
                prompt: "select_account",
                access_type: "offline",
                response_type: "code",
              },
            },
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const user = await getUserByEmail(credentials.email);
        if (!user) return null;
        await upsertUser(
          { id: user.id, name: user.name, email: user.email, image: user.image },
          "email"
        );
        return { id: user.id, email: user.email, name: user.name, image: user.image ?? null };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error:  "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await upsertUser(user, account.provider);
        } catch {
          // Non-blocking
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & { id: string }).id = token.id as string;
      }
      return session;
    },
  },
};
