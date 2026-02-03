import { PartnerSidebar } from "@/components/layouts/PartnerSidebar";

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerSidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-10">
            <h1 className="font-semibold text-lg text-gray-800">Partner Dashboard</h1>
            <div className="flex items-center gap-4">
                {/* User Dropdown or Avatar could go here */}
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-bold">
                    P
                </div>
            </div>
        </header>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
