export function asDate(x: any): Date {
  if (x instanceof Date) return x;
  if (x?.toDate) return x.toDate();
  if (typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x)) {
    const [y, m, d] = x.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(x);
}
