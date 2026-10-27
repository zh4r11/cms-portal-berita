export const PER_PAGE = 10;

export type PageMeta = {
  page: number;
  lastPage: number;
  total: number;
  from: number;
  to: number;
};

export type Paginated<T> = PageMeta & { data: T[] };

export function parsePage(value: string | string[] | undefined): number {
  const page = Number(Array.isArray(value) ? value[0] : value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

/** Hitung offset & meta paginasi; halaman di luar jangkauan ditarik ke halaman terakhir. */
export function paginate(requestedPage: number, total: number, perPage = PER_PAGE) {
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(requestedPage, lastPage);
  const skip = (page - 1) * perPage;

  return {
    skip,
    take: perPage,
    meta(count: number): PageMeta {
      return {
        page,
        lastPage,
        total,
        from: count ? skip + 1 : 0,
        to: skip + count,
      };
    },
  };
}

export function param(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}
