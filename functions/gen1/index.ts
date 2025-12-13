import { createHelloApp } from "../src/express_app";
import * as functions from "firebase-functions";
import { writeSystemLog } from "../src/log";

// ✅ Express Router (V1)
export const helloV1 = functions
  .region("asia-northeast1")
  .https.onRequest(createHelloApp(" from V1"));

// ✅ Auth onDelete (V1 only)

export const onUserDeleteV1 = functions
  .region("asia-northeast1")
  .auth.user()
  .onDelete(async (user) => {
    await writeSystemLog("auth_on_delete_v1", {
      uid: user.uid,
      email: user.email ?? null,
      providerData: user.providerData?.map((p) => ({
        providerId: p.providerId,
        uid: p.uid,
      })) ?? [],
    });
  });

// ✅ pubsub.schedule (V1) — 1時間ごとにログ
export const hourlyJobV1 = functions
  .region("asia-northeast1")
  .pubsub.schedule("0 * * * *") // 毎時0分
  .timeZone("Asia/Tokyo")
  .onRun(async () => {
    await writeSystemLog("pubsub_schedule_v1", {
      note: "hourly tick",
    });
  });
