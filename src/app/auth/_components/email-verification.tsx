"use client";

import { BetterAuthActionButton } from "@/components/auth/better-auth-action-button";
import { authClient } from "@/lib/auth/auth-client";
import { useEffect, useRef, useState } from "react";

export function EmailVerification({ email }: { email: string }) {
  const [timeToNextResend, setTimeToNextResend] = useState(30);
  const intervalRef = useRef<number | null>(null);

  function clearTimer() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function startTimer() {
    clearTimer();

    intervalRef.current = window.setInterval(() => {
      setTimeToNextResend((t) => {
        if (t <= 1) {
          clearTimer();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    authClient.sendVerificationEmail({
      email,
      callbackURL: "/",
    });

    startTimer(); // ✅ no synchronous setState

    return clearTimer;
  }, [email]);

  function resend() {
    setTimeToNextResend(30); // ✅ event handler is fine
    startTimer();

    return authClient.sendVerificationEmail({
      email,
      callbackURL: "/",
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mt-2">
        We sent you a verification link. Please check your email ({email}) and
        click the link to verify your account.
      </p>

      <BetterAuthActionButton
        variant="outline"
        className="w-full"
        successMessage="Verification email sent!"
        disabled={timeToNextResend > 0}
        action={resend}
      >
        {timeToNextResend > 0
          ? `Resend Email (${timeToNextResend})`
          : "Resend Email"}
      </BetterAuthActionButton>
    </div>
  );
}
