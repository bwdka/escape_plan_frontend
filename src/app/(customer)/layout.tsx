import { CustomerNavbar } from "@/components/layouts/CustomerNavbar";
import { CustomerFooter } from "@/components/layouts/CustomerFooter";
import { BottomSearchNav } from "@/components/layouts/BottomSearchNav";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pt-20">
        <CustomerNavbar />
        {children}
      </main>
      <BottomSearchNav />
      <CustomerFooter />
    </div>
  );
}
