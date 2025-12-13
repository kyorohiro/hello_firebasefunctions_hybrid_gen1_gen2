import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

let initialized = false;

function ensureAdmin() {
  if (!initialized) {
    initializeApp({ credential: applicationDefault() });
    initialized = true;
  }
}

export async function writeSystemLog(
  type: string,
  payload: Record<string, unknown>
) {
  ensureAdmin();
  const db = getFirestore();
  await db.collection("system_logs").add({
    type,
    payload,
    createdAt: FieldValue.serverTimestamp(),
  });
}

