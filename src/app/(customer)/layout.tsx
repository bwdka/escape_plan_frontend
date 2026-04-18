'use client';

import { CustomerNavbar } from "@/components/layouts/CustomerNavbar";
import { CustomerFooter } from "@/components/layouts/CustomerFooter";
import { BottomSearchNav } from "@/components/layouts/BottomSearchNav";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen">
      <CustomerNavbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 pt-28"
        >
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </motion.main>
      </AnimatePresence>
      <BottomSearchNav />
      <CustomerFooter />
    </div>
  );
}
