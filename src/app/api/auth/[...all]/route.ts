import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import arcjet, { BotOptions, detectBot, EmailOptions, protectSignup, shield, slidingWindow, SlidingWindowRateLimitOptions } from "@arcjet/next"
import { findIp } from "@arcjet/ip"

const aj = arcjet({
    key: process.env.ARCJET_API_KEY!,
    characteristics: ['userIdOrIp'],
    rules: [
        shield({ mode: 'LIVE' })
    ]
})

const botSettings = { mode: "LIVE", allow: [], } satisfies BotOptions
const restrictiveRateLimit = { mode: "LIVE", max: 10, interval: '10m' } satisfies SlidingWindowRateLimitOptions<[]>
const laxRateLimit = { mode: "LIVE", max: 60, interval: '10m' } satisfies SlidingWindowRateLimitOptions<[]>
const emailSettings = { mode: 'LIVE', block: ['DISPOSABLE', 'INVALID', 'NO_MX_RECORDS'] } satisfies EmailOptions

const authHandlers = toNextJsHandler(auth);

export const { GET } = authHandlers

export async function POST(request: Request) {
    const clonedRequest = request.clone()

    const decision = await checkArcjet(request)
    if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
            return new Response(null, { status: 429 })
        } else if (decision.reason.isEmail()) {
            let message: string;
            if (decision.reason.emailTypes.includes('INVALID')) {
                message = "Email Address format is invalid"
            } else if (decision.reason.emailTypes.includes('DISPOSABLE')) {
                message = "Disposable emails not allowed"
            } else if (decision.reason.emailTypes.includes('NO_MX_RECORDS')) {
                message = "Email domain not valid"
            } else {
                message = "Invalid Email"
            }
            return Response.json({ message }, { status: 400 })
        } else {
            return new Response(null, { status: 403 })
        }
    }

    return authHandlers.POST(clonedRequest)
}

async function checkArcjet(request: Request) {
    const body = (await request.json()) as unknown
    const session = await auth.api.getSession({ headers: request.headers })

    const userIdOrIp = (session?.user.id ?? findIp(request)) || "127.0.0.1"

    if (request.url.includes("/auth/sign-up") || request.url.includes("/auth/sign-in")) {
        if (body && typeof body === 'object' && "email" in body && typeof body.email === "string") {
            return aj.withRule(protectSignup({ email: emailSettings, bots: botSettings, rateLimit: restrictiveRateLimit })).protect(request, { email: body.email, userIdOrIp })
        } else {
            return aj.withRule(detectBot(botSettings)).withRule(slidingWindow(restrictiveRateLimit)).protect(request, { userIdOrIp })
        }
    }

    return aj.withRule(detectBot(botSettings)).withRule((slidingWindow(laxRateLimit))).protect(request, { userIdOrIp })
}