import { Tent } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2 text-primary mb-6">
            <Tent className="h-10 w-10" />
          </Link>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Welcome to Escape Plan
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
}
