// src/repositories/serviceRepo.ts
import { db } from "../lib/firebase";
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, serverTimestamp, query, orderBy,
  getDocs
} from "firebase/firestore";
import type { Service } from "../types/service";

// Escuta em tempo real a coleção `services` ordenada por nome
export function listenServices(
  onChange: (items: Service[]) => void,
  onError?: (e: unknown) => void
) {
  const q = query(collection(db, "services"), orderBy("name"));
  return onSnapshot(
    q,
    (snap) => {
      const rows: Service[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Service, "id">),
      }));
      onChange(rows);
    },
    onError
  );
}

export async function createService(data: Omit<Service, "id">) {
  await addDoc(collection(db, "services"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateService(id: string, data: Partial<Omit<Service, "id">>) {
  await updateDoc(doc(db, "services", id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteService(id: string) {
  await deleteDoc(doc(db, "services", id));
}

export async function getAllServicesOnce(): Promise<Service[]> {
  const q = query(collection(db, "services"), orderBy("name", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Service, "id">),
  }));
}
