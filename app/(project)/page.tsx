import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Template SaaS",
  description: "This is the landing page of the application.",
};

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Landing page</h1>
      <Link href="/login">
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Go to Login
        </button>
      </Link>
    </div>
  );
}
