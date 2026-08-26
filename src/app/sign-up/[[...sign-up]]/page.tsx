import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default async function Page({ searchParams }: { searchParams: Promise<{ redirect_url?: string }> }) {
  const requested = (await searchParams).redirect_url;
  const target = requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard";
  return <main className="auth-page"><Link className="brand" href="/">HERO</Link><SignUp forceRedirectUrl={target} /></main>;
}
