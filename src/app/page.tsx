"use client";
import { BetterAuthActionButton } from "@/components/auth/better-auth-action-button";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session, isPending: isLoading } = authClient.useSession();
  const [adminPermission, setAdminPermission] = useState<{
    userId: string;
    hasAccess: boolean;
  } | null>(null);

  useEffect(() => {
    if (session == null) return;

    let isMounted = true;

    authClient.admin
      .hasPermission({ permissions: { user: ["list"] } })
      .then(({ data }) => {
        if (isMounted) {
          setAdminPermission({
            userId: session.user.id,
            hasAccess: data?.success ?? false,
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setAdminPermission({
            userId: session.user.id,
            hasAccess: false,
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [session]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="my-6 px-4 max-w-md mx-auto">
      <div className="text-center space-y-6">
        {session == null ? (
          <>
            <h1 className="text-3xl font-bold">Welcome to App</h1>
            <Button asChild size="lg">
              <Link href="/auth/login">SignIn / SignUp</Link>
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold">Welcome {session.user.name}!</h1>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/profile">Profile</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/organizations">Organizations</Link>
              </Button>
              {adminPermission?.userId === session.user.id &&
                adminPermission.hasAccess && (
                <Button variant="outline" asChild size="lg">
                  <Link href="/admin">Admin</Link>
                </Button>
              )}
              <BetterAuthActionButton
                size="lg"
                variant="destructive"
                action={() => authClient.signOut()}
              >
                Sign Out
              </BetterAuthActionButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
