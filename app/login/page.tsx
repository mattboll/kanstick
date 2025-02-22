import { auth } from "@/auth";
import { Header } from "../_components/header";

export default async function PagesLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <>
      <Header session={session} />
      {children}
    </>
  );
}
