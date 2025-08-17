// src/utils/schedule.ts
import type { Appointment } from "../types/appointment";

export const WEEK_SLOTS: Record<number, string[]> = {
  0: [], // Domingo
  1: ["10:00", "13:00", "17:00"],                     // Segunda
  2: ["08:00", "10:00", "13:00", "17:00"],            // Terça
  3: ["10:00", "13:00", "17:00"],                     // Quarta
  4: ["08:00", "10:00", "13:00", "17:00"],            // Quinta
  5: ["10:00", "13:00", "17:00"],                     // Sexta
  6: ["07:00", "08:00", "13:00", "14:00", "17:00"],   // Sábado
};

/** Horários fixos do dia (0=Dom..6=Sáb) */
export function getSlotsForDate(date?: Date | null): string[] {
  if (!date) return [];
  return WEEK_SLOTS[date.getDay()] ?? [];
}

/** Alias para compatibilizar com os imports existentes */
export const slotsForDate = getSlotsForDate;

/** Comparação de dia ignorando hora/fuso */
export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Horários ocupados no dia (ordenados e sem repetição) */
export function busyTimesFor(date: Date, appointments: Appointment[]): string[] {
  const times = appointments
    .filter((a) => isSameDay(a.date, date))
    .map((a) => a.time)
    .sort((a, b) => a.localeCompare(b));

  return Array.from(new Set(times));
}
