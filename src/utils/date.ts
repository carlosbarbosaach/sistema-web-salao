export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
export function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
export function getMonthMatrix(currentMonth: Date) {
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const startDay = new Date(start.getFullYear(), start.getMonth(), 1).getDay(); // dom=0
  const daysInMonth = end.getDate();

  // pré-preenche com dias do mês anterior para alinhar o grid
  const dates: Date[] = [];
  for (let i = 0; i < startDay; i++) {
    dates.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i - startDay + 1));
  }
  // dias do mês atual
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }
  // completa até múltiplo de 7
  while (dates.length % 7 !== 0) {
    const last = dates[dates.length - 1];
    dates.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1));
  }
  return dates;
}
export const WEEK_DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
export function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}
