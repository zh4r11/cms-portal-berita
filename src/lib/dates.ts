import { APP_TIMEZONE } from "@/lib/cms";

/** Tanggal hari ini (YYYY-MM-DD) menurut zona waktu aplikasi. */
export function hariIni(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function tahunIni(): number {
  return Number(hariIni().slice(0, 4));
}

/** Kolom `@db.Date` disimpan sebagai tengah malam UTC. */
export function toDbDate(ymd: string): Date {
  return new Date(`${ymd}T00:00:00Z`);
}

export function fromDbDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Selisih zona waktu aplikasi terhadap UTC (menit) pada tanggal tertentu. */
function offsetMenit(date: Date): number {
  const bagian = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIMEZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  const v = (type: string) => Number(bagian.find((p) => p.type === type)?.value);
  const lokal = Date.UTC(v("year"), v("month") - 1, v("day"), v("hour"), v("minute"));

  return Math.round((lokal - Math.floor(date.getTime() / 60_000) * 60_000) / 60_000);
}

/** Nilai untuk <input type="datetime-local"> menurut zona waktu aplikasi. */
export function toDatetimeLocal(date: Date): string {
  return new Date(date.getTime() + offsetMenit(date) * 60_000).toISOString().slice(0, 16);
}

/** Kebalikan toDatetimeLocal; null bila format tidak valid. */
export function fromDatetimeLocal(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return null;
  }

  const kira = new Date(`${value}:00Z`);

  return new Date(kira.getTime() - offsetMenit(kira) * 60_000);
}
