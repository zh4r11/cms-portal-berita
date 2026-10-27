import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";

/** Kolom isi + sidebar; di layar sempit sidebar turun ke bawah isi. */
export function DenganSidebar({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="min-w-0">{children}</div>
      <Sidebar />
    </div>
  );
}
