"use client";

import { motion } from "framer-motion";

import { easeOutExpo } from "@/lib/motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: easeOutExpo }}>
      {children}
    </motion.div>
  );
}
