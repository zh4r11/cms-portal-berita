import type { ReactNode } from "react";
import { AppSidebarHeader, type BreadcrumbItem } from "@/components/app-sidebar-header";

export default function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2" data-print="hide">
          {children}
        </div>
      )}
    </div>
  );
}

/** Kerangka halaman panel: header breadcrumb + area konten. */
export function PageContainer({ breadcrumbs = [], children }: { breadcrumbs?: BreadcrumbItem[]; children: ReactNode }) {
  return (
    <>
      <AppSidebarHeader breadcrumbs={breadcrumbs} />
      <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
    </>
  );
}
