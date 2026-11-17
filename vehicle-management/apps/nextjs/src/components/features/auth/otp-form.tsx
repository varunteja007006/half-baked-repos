"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@fleetio/ui/button";
import { Input } from "@fleetio/ui/input";

import { authClient } from "~/auth/client";

const COUNTRY_CODE = "+91";

export function OtpForm() {
  const [code, setCode] = React.useState("");
  const [countryCode] = React.useState(COUNTRY_CODE);
  const [phoneNumber, setPhoneNumber] = React.useState("");

  const [isSending, setIsSending] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const router = useRouter();

  const { data } = authClient.useSession();

  // manage resend cooldown timer
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => {
      setResendCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  if (data?.user) {
    return null;
  }

  return (
    <div className="min-w-sm space-y-4">
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">Phone number</label>
        <Input
          value={phoneNumber}
          onChange={(e) => {
            const v = e.target.value || "";
            // Basic normalization: keep + and digits only
            const normalized = v.replace(/[^+\d]/g, "");
            setPhoneNumber(normalized);
          }}
          inputMode="tel"
          placeholder="Eg: 9876543210"
          aria-label="Phone number"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">Verification code</label>
        <Input
          value={code}
          onChange={(e) => {
            const v = e.target.value || "";
            setCode(v.replace(/[^\d]/g, ""));
          }}
          inputMode="numeric"
          maxLength={6}
          placeholder="6-digit code"
          aria-label="Verification code"
        />
      </div>

      <div className="flex items-center gap-5">
        <Button
          type="button"
          disabled={
            isSending || resendCooldown > 0 || !isValidPhone(phoneNumber)
          }
          onClick={() => {
            const phoneValidation = phoneSchema.safeParse(phoneNumber);
            if (!phoneValidation.success) {
              toast.error("Enter a valid phone number (E.164)");
              return;
            }
            setIsSending(true);
            authClient.phoneNumber
              .sendOtp({
                phoneNumber: countryCode + phoneValidation.data,
              })
              .then((res) => {
                const { data, error } = res;
                if (error) {
                  toast.error(error.message);
                  return;
                }
                toast.success(data.message);
                // start cooldown (60s)
                setResendCooldown(60);
              })
              .catch((err) => {
                toast.error(err.message);
              })
              .finally(() => {
                setIsSending(false);
              });
          }}
        >
          {isSending
            ? "Sending…"
            : resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : "Send Code"}
        </Button>

        <Button
          type="button"
          disabled={
            isVerifying || !isValidPhone(phoneNumber) || !isValidCode(code)
          }
          onClick={() => {
            const phoneValidation = phoneSchema.safeParse(phoneNumber);
            const codeValidation = codeSchema.safeParse(code);
            if (!phoneValidation.success) {
              toast.error("Enter a valid phone number (E.164)");
              return;
            }
            if (!codeValidation.success) {
              toast.error("Enter a valid 6-digit code");
              return;
            }
            setIsVerifying(true);
            authClient.phoneNumber
              .verify({
                phoneNumber: countryCode + phoneValidation.data,
                code: codeValidation.data,
              })
              .then((res) => {
                const { data, error } = res;
                if (error) {
                  toast.error(error.message);
                  return;
                }
                toast.success(data.status);
                router.push("/dashboard");
              })
              .catch((err: Error) => {
                toast.error(err.message);
              })
              .finally(() => {
                setIsVerifying(false);
              });
          }}
        >
          {isVerifying ? "Verifying…" : "Verify"}
        </Button>
      </div>
    </div>
  );
}

const phoneSchema = z
  .string()
  .min(10, "Phone number is required")
  // Very basic E.164-ish check: starts with + and 8-15 digits, or digits only 10-15
  .refine(
    (v) => /^(\+\d{8,15}|\d{10,15})$/.test(v),
    "Invalid phone number format",
  );

const codeSchema = z
  .string()
  .length(6, "Code must be 6 digits")
  .refine((v) => /^\d{6}$/.test(v), "Code must be numeric");

function isValidPhone(v: string) {
  return phoneSchema.safeParse(v).success;
}

function isValidCode(v: string) {
  return codeSchema.safeParse(v).success;
}
