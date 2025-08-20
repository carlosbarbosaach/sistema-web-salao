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

export function getSlotsForDate(date?: Date | null): string[] {
  if (!date) return [];
  return WEEK_SLOTS[date.getDay()] ?? [];
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function busyTimesFor(date: Date, appointments: Appointment[]): string[] {
  return appointments
    .filter(a => isSameDay(a.date, date))
    .map(a => a.time);
}
