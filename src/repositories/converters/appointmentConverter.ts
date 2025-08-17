// src/repositories/converters/appointmentConverter.ts
import {
 
  QueryDocumentSnapshot,
  type FirestoreDataConverter,
} from "firebase/firestore";
import type { Appointment } from "../../types/appointment";
import { asLocalDate } from "../../utils/date";

type AppointmentFS = Omit<Appointment, "id" | "date"> & {
  date: any; // Timestamp | string | Date
};

export const appointmentConverter: FirestoreDataConverter<Appointment> = {
  toFirestore(a: Appointment) {
    // pode gravar Date direto (Firestore salva como Timestamp)
    const { id, ...rest } = a;
    return rest;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Appointment {
    const data = snapshot.data() as AppointmentFS;
    return {
      id: snapshot.id,
      title: data.title,
      client: data.client,
      phone: data.phone,
      time: data.time,
      date: asLocalDate(data.date),
    };
  },
};
