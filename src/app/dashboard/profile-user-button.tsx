import Image from "next/image";
import { UserButton } from "@clerk/nextjs";

export function ProfileUserButton({ photoUrl, large = false }: { photoUrl: string | null; large?: boolean }) {
  return <div className={large ? "profile-user-button large" : "profile-user-button"}>
    <UserButton/>
    {photoUrl ? <span className="profile-user-photo" aria-hidden="true"><Image src={photoUrl} alt="" fill sizes={large ? "40px" : "32px"} unoptimized/></span> : null}
  </div>;
}
