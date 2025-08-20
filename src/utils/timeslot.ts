// src/utils/timeslot.ts
import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

// ID do slot: "YYYY-MM-DD_HH:mm"
export function makeSlotId(date: Date, time: string) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}_${time.slice(0, 5)}`;
}

export async function blockTimeslot(date: Date, time: string) {
  const slotId = makeSlotId(date, time);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  await setDoc(
    doc(db, "timeslots", slotId),
    {
      date: `${y}-${m}-${d}`,
      time: time.slice(0, 5),
      available: false,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function unblockTimeslot(date: Date, time: string) {
  // Se preferir manter histórico, troque por setDoc(..., {available:true}, {merge:true})
  const slotId = makeSlotId(date, time);
  await deleteDoc(doc(db, "timeslots", slotId));
}
