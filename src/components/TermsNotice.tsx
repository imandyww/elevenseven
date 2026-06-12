import Link from "next/link";

export function TermsNotice() {
  return (
    <p className="mt-2 text-center text-[11px] leading-snug text-ink-soft/70">
      By paying you agree to the{" "}
      <Link href="/terms" className="underline underline-offset-2 hover:text-blue">
        Terms of Service
      </Link>
      .
    </p>
  );
}
