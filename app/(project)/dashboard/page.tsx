import { handleAuth } from "@/app/actions/handle-auth";
import { auth } from "@/app/lib/auth";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard page",
};

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">protected Dashboard</h1>
      <p>
        {session?.user?.email
          ? session?.user?.email
          : "usuario nao esta logado!!"}
      </p>
      {session?.user?.email && (
        <form action={handleAuth}>
          <button
            type="submit"
            className="border rounded-md px-2 py-1 cursor-pointer"
          >
            Logout
          </button>
        </form>
      )}

      <Link href={"/pagamentos"}>Pagamentos</Link>
    </div>
  );
}
