"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
import Link from "next/link";

export default function Home() {
  const { data: session, isPending: isLoading } = authClient.useSession();

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
            <h1 className="text-3xl font-bold">
              Welcome, {session?.user.name}
            </h1>
            <Button
              size="lg"
              variant={"destructive"}
              onClick={() => authClient.signOut()}
            >
              SignOut{" "}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
