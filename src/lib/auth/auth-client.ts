import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields, twoFactorClient, adminClient, organizationClient } from "better-auth/client/plugins"
import { passkeyClient } from "@better-auth/passkey/client"
import { auth } from "./auth"
import { ac, admin, user } from "@/components/auth/permissions"

export const authClient = createAuthClient({
    plugins: [inferAdditionalFields<typeof auth>(), twoFactorClient({
        onTwoFactorRedirect: () => {
            // Better Auth invokes this outside a React component, so use the browser location API.
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.assign("/auth/2fa")
        }
    }), passkeyClient(), adminClient({
        ac,
        roles: {
            admin: admin,
            user: user
        }
    }), organizationClient()]
})
