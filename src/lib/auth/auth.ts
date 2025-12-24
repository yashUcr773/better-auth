import { db } from "@/drizzle/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { sendPasswordResetEmail } from "../emails/password-reset-email";
import { sendVerificationEmail } from "../emails/verification-email";
import { createAuthMiddleware } from "better-auth/api";
import { sendWelcomeEmail } from "../emails/welcom-email";
import { sendDeleteAccountVerificationEmail } from "../emails/delete-email";
import { twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
    user: {
        changeEmail: {
            enabled: true,
            sendChangeEmailVerification: async ({ user, url, newEmail }) => {
                await sendVerificationEmail({
                    user: { ...user, email: newEmail }, url
                })
            },
        },
        deleteUser: {
            enabled: true,
            sendDeleteAccountVerification: async ({ user, url }) => {
                await sendDeleteAccountVerificationEmail({ user, url })
            }
        },
        additionalFields: {
            favouriteNumber: {
                type: 'number',
                required: true
            }
        }
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url }) => {
            await sendPasswordResetEmail({ user, url })
        }
    },
    emailVerification: {
        autoSignInAfterVerification: true,
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url }) => {
            await sendVerificationEmail({ user, url })
        }
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60
        }
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            mapProfileToUser: (profile) => {
                return {
                    favouriteNumber: +profile.public_repos || 0
                }
            }
        },
        discord: {
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
            mapProfileToUser: () => {
                return {
                    favouriteNumber: 0
                }
            }
        }
    },
    plugins: [nextCookies(), twoFactor()],
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
    }),
    hooks: {
        after: createAuthMiddleware(async ctx => {
            if (ctx.path.startsWith('/sign-up')) {
                console.log("🚀 ~ ctx:", ctx)
                const user = ctx.context.newSession?.user ?? { name: ctx.body.name, email: ctx.body.email }
                if (user != null) {
                    await sendWelcomeEmail(user)
                }
            }
        })
    }
});