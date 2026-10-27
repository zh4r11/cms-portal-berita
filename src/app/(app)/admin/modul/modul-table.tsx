"use client";

import DataTableCard from "@/components/data-table-card";
import Field from "@/components/field";
import FormDialog from "@/components/form-dialog";
import PageHeader from "@/components/page-header";
import RowActions from "@/components/row-actions";
import { SimpleSelect } from "@/components/select-field";
import { AktifBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { ubahModul } from "./actions";

type Modul = { id: number; nama: string; link: string; grup: string; status: "admin" | "user"; urutan: number; aktif: boolean; pengguna: number };
type Form = { nama: string; status: string; urutan: string; aktif: boolean };

export function ModulTable({ modul }: { modul: Modul[] }) {
  const crud = useCrudDialog<Modul, Form>({
    empty: { nama: "", status: "user", urutan: "0", aktif: true },
    toForm: (m) => ({ nama: m.nama, status: m.status, urutan: String(m.urutan), aktif: m.aktif }),
    store: async () => ({ ok: false, message: "Daftar modul mengikuti halaman yang tersedia di panel." }),
    update: ubahModul,
  });

  return (
    <>
      <PageHeader
        title="Manajemen Modul"
        description="Nama dan urutan modul di sidebar, serta siapa yang boleh membukanya. Modul khusus admin tidak bisa diberikan ke level user."
      />

      <DataTableCard
        rows={modul}
        rowKey={(m) => m.id}
        columns={[
          {
            header: "Modul",
            cell: (m) => (
              <div>
                <p className="font-medium">{m.nama}</p>
                <p className="text-xs text-muted-foreground">
                  {m.grup} · /admin/{m.link}
                </p>
              </div>
            ),
          },
          {
            header: "Hak akses",
            cell: (m) => (
              <div className="space-y-1">
                <Badge variant={m.status === "admin" ? "default" : "outline"}>{m.status === "admin" ? "Khusus admin" : "Bisa diberikan"}</Badge>
                {m.status === "user" && <p className="text-xs text-muted-foreground">{m.pengguna} akun user</p>}
              </div>
            ),
            className: "w-40",
          },
          { header: "Urutan", cell: (m) => m.urutan, className: "w-20 tabular-nums" },
          { header: "Status", cell: (m) => <AktifBadge aktif={m.aktif} />, className: "w-28" },
          { header: "Aksi", cell: (m) => <RowActions onEdit={() => crud.openEdit(m)} />, className: "w-16 text-right" },
        ]}
      />

      <FormDialog
        open={crud.open}
        onOpenChange={crud.setOpen}
        title={`Ubah modul ${crud.editing?.nama ?? ""}`}
        description="Modul nonaktif disembunyikan dari akun level user. Admin tetap melihatnya."
        processing={crud.form.processing}
        onSubmit={crud.submit}
      >
        <Field id="nama" label="Nama di sidebar" error={crud.form.errors.nama}>
          <Input id="nama" value={crud.form.data.nama} onChange={(e) => crud.form.setData("nama", e.target.value)} autoFocus />
        </Field>
        <Field id="status" label="Hak akses" error={crud.form.errors.status}>
          <SimpleSelect
            id="status"
            value={crud.form.data.status}
            onChange={(v) => crud.form.setData("status", v)}
            options={[
              { value: "user", label: "Bisa diberikan ke level user" },
              { value: "admin", label: "Khusus admin" },
            ]}
          />
        </Field>
        <Field id="urutan" label="Urutan" error={crud.form.errors.urutan}>
          <Input id="urutan" type="number" min={0} max={999} value={crud.form.data.urutan} onChange={(e) => crud.form.setData("urutan", e.target.value)} />
        </Field>
        <div className="flex items-center gap-3">
          <Checkbox id="aktif" checked={crud.form.data.aktif} onCheckedChange={(v) => crud.form.setData("aktif", v === true)} />
          <Label htmlFor="aktif">Aktif</Label>
        </div>
      </FormDialog>
    </>
  );
}
