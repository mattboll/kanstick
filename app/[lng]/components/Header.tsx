"use client";
import { Session } from "next-auth";
import SignIn from "./sign-in";
import SignOut from "./sign-out";
import { languages } from "@/app/i18n/settings";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface HeaderProps {
  session?: Session | null;
  lng: string;
}

export function Header({ session, lng }: HeaderProps) {
  const pathname = usePathname();

  const redirectedPathName = (newLng: string) => {
    if (!pathname) return `/${newLng}`;
    const segments = pathname.split("/");
    segments[1] = newLng;
    return segments.join("/");
  };

  return (
    <header className="bg-gradient-to-b from-slate-800 to-slate-900/80 text-white p-4 flex flex-row justify-between items-center border-b border-slate-700/30 backdrop-blur-sm">
      <div className="flex items-center space-x-4">
        {session?.user ? (
          <Link href={`/${lng}/home`} className="text-xl font-bold">
            Kanstick
          </Link>
        ) : (
          <Link href={`/${lng}`} className="text-xl font-bold">
            Kanstick
          </Link>
        )}
      </div>

      <div className="text-sm text-gray-200">
        {languages.map((l) => (
          <Link
            key={l}
            href={redirectedPathName(l)}
            className={`${
              l === lng ? "font-bold text-gray-400" : ""
            } px-1 hover:text-gray-500 transition-colors`}
          >
            {l.toUpperCase()}
          </Link>
        ))}
      </div>
      {session?.user ? (
        <div className="flex flex-row justify-between items-center">
          <div className="mr-4">{session.user.name}</div>
          <SignOut />
        </div>
      ) : (
        <SignIn />
      )}
    </header>
  );
}
