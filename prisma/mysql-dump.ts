/**
 * Pembaca dump phpMyAdmin/mysqldump yang cukup untuk file .sql CMS Lokomedia:
 * hanya perintah `INSERT INTO `tabel` (kolom, ...) VALUES (...), (...);`.
 */
export type Row = Record<string, string | number | null>;

export function parseDump(sql: string): Map<string, Row[]> {
  const tables = new Map<string, Row[]>();
  const header = /INSERT INTO `(\w+)` \(([^)]*)\) VALUES\s*/g;
  let match: RegExpExecArray | null;

  while ((match = header.exec(sql))) {
    const table = match[1];
    const columns = match[2].split(",").map((c) => c.trim().replace(/`/g, ""));
    const { rows, end } = parseValues(sql, header.lastIndex);
    const list = tables.get(table) ?? [];

    for (const values of rows) {
      list.push(Object.fromEntries(columns.map((column, i) => [column, values[i] ?? null])));
    }

    tables.set(table, list);
    header.lastIndex = end;
  }

  return tables;
}

const ESCAPE: Record<string, string> = { n: "\n", r: "\r", t: "\t", "0": "\0", Z: "\x1a" };

function parseValues(sql: string, start: number) {
  const rows: (string | number | null)[][] = [];
  let i = start;
  let row: (string | number | null)[] = [];

  while (i < sql.length) {
    const ch = sql[i];

    if (ch === "(") {
      row = [];
      i++;
    } else if (ch === "'") {
      let value = "";
      i++;

      while (i < sql.length) {
        const c = sql[i];

        if (c === "\\") {
          const next = sql[i + 1];
          value += ESCAPE[next] ?? next;
          i += 2;
        } else if (c === "'" && sql[i + 1] === "'") {
          value += "'";
          i += 2;
        } else if (c === "'") {
          i++;
          break;
        } else {
          value += c;
          i++;
        }
      }

      row.push(value);
    } else if (ch === ")") {
      rows.push(row);
      i++;
    } else if (ch === ";") {
      return { rows, end: i + 1 };
    } else if (ch === "," || /\s/.test(ch)) {
      i++;
    } else {
      // Angka atau NULL tanpa tanda kutip.
      let raw = "";

      while (i < sql.length && !/[,)\s]/.test(sql[i])) {
        raw += sql[i++];
      }

      row.push(raw.toUpperCase() === "NULL" ? null : Number(raw));
    }
  }

  return { rows, end: i };
}
