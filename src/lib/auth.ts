import { createHash, timingSafeEqual } from "node:crypto";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { APP_NAME } from "@/lib/cms";
import { prisma } from "@/lib/prisma";

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

const MD5 = /^[a-f0-9]{32}$/;

/**
 * Akun hasil impor dari CMS lama masih menyimpan hash MD5. Hash itu tetap
 * diterima saat login, lalu diganti hash scrypt begitu password diubah.
 */
async function verifikasiPassword({ hash, password }: { hash: string; password: string }) {
  if (MD5.test(hash)) {
    const md5 = createHash("md5").update(password).digest();

    return timingSafeEqual(md5, Buffer.from(hash, "hex"));
  }

  return verifyPassword({ hash, password });
}

export const auth = betterAuth({
  appName: APP_NAME,
  baseURL,
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    // Akun redaksi dibuat admin di menu Manajemen User, tidak ada pendaftaran publik.
    disableSignUp: true,
    minPasswordLength: 8,
    revokeSessionsOnPasswordReset: true,
    password: { hash: hashPassword, verify: verifikasiPassword },
    // Belum ada mailer: tautan reset ditulis ke log server.
    sendResetPassword: async ({ user, url }) => {
      console.info(`[reset-password] ${user.email}: ${url}`);
    },
  },

  user: {
    additionalFields: {
      level: { type: "string", required: false, defaultValue: "user", input: false },
      blokir: { type: "boolean", required: false, defaultValue: false, input: false },
      noTelp: { type: "string", required: false },
    },
  },

  databaseHooks: {
    session: {
      create: {
        // Satu pintu untuk semua cara login: akun yang diblokir tidak mendapat sesi.
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { blokir: true },
          });

          if (!user || user.blokir) {
            throw new APIError("FORBIDDEN", {
              message: "Akun Anda sedang diblokir. Silakan hubungi admin.",
              code: "ACCOUNT_BLOCKED",
            });
          }
        },
      },
    },
  },

  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
      usernameValidator: (value) => /^[a-zA-Z0-9_-]+$/.test(value),
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;

export { hashPassword };
