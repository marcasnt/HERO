import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function Page() {
  return <main className="auth-page"><Link className="brand" href="/">HERO</Link><SignUp /></main>;
}
