import { AdminSidebar } from "@/components/layouts/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="ml-64 flex flex-col min-h-screen">
         <header className="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
            <h1 className="font-semibold text-lg text-slate-800">Admin Control Center</h1>
            <div className="flex items-center gap-4">
                 <div className="h-8 w-8 bg-slate-800 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    A
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
