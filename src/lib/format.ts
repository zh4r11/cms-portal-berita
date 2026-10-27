import { APP_TIMEZONE } from "@/lib/cms";

type DateInput = Date | string | null | undefined;

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function formatter(options: Intl.DateTimeFormatOptions, timeZone: string) {
  return new Intl.DateTimeFormat("id-ID", { ...options, timeZone });
}

/**
 * Kolom tanggal (`@db.Date`) bernilai tengah malam UTC dan diformat apa
 * adanya; timestamp diformat menurut zona waktu aplikasi. Zona waktu
 * selalu eksplisit agar hasil server & browser sama.
 */
function resolve(value: Date | string): { date: Date; timeZone: string } {
  if (typeof value === "string") {
    return DATE_ONLY.test(value)
      ? { date: new Date(`${value}T00:00:00Z`), timeZone: "UTC" }
      : { date: new Date(value), timeZone: APP_TIMEZONE };
  }

  const isDateOnly =
    value.getUTCHours() === 0 && value.getUTCMinutes() === 0 && value.getUTCSeconds() === 0 && value.getUTCMilliseconds() === 0;

  return { date: value, timeZone: isDateOnly ? "UTC" : APP_TIMEZONE };
}

function format(value: DateInput, options: Intl.DateTimeFormatOptions, forceZone?: string): string {
  if (!value) {
    return "-";
  }

  const { date, timeZone } = resolve(value);

  return formatter(options, forceZone ?? timeZone).format(date);
}

export function formatTanggal(value: DateInput): string {
  return format(value, { day: "numeric", month: "long", year: "numeric" });
}

export function formatTanggalSingkat(value: DateInput): string {
  return format(value, { day: "2-digit", month: "short", year: "numeric" });
}

export function formatWaktu(value: DateInput): string {
  return format(value, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }, APP_TIMEZONE);
}

export function formatAngka(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}
