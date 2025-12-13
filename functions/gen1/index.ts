import { createHelloApp } from "../src/express_app";
import * as functions from "firebase-functions/v1";
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


/**
 * gen2 / Cloud Run 側の URL（固定したいなら環境変数に）
 * 例: https://hellov2-zsrapsbcgq-an.a.run.app
 */
const GEN2_BASE_URL = "https://asia-northeast1-hello-funcs-v1v2.cloudfunctions.net/helloV1";

// cloudfunctions.net 側の関数名（入口）
// ここを変えれば helloV1Proxy / openidCiviliosProxy 等に使い回せる
const PROXY_FUNCTION_NAME = "helloV1Proxy";

export const helloV1Proxy = functions
  .region("asia-northeast1")
  .https.onRequest(async (req, res) => {
    try {
      // req.originalUrl: "/helloV1Proxy/hello?x=1" のような形になる
      const originalUrl = req.originalUrl || req.url || "/";
      const u = new URL(originalUrl, "http://localhost"); // base はダミーでOK

      // "/helloV1Proxy/..." から "/..." へ剥がす
      const prefix = `/${PROXY_FUNCTION_NAME}`;
      let forwardedPath = u.pathname;

      if (forwardedPath === prefix) {
        forwardedPath = "/";
      } else if (forwardedPath.startsWith(prefix + "/")) {
        forwardedPath = forwardedPath.slice(prefix.length);
      }
      // もし想定外のパスなら、そのまま投げずに 400 にして事故を防ぐ
      else {
        forwardedPath = u.pathname;
        //res.status(400).send(`Bad proxy path: expected prefix ${prefix}, got ${u.pathname} ${req.method}`);
        //return;
      }

      // 転送先 URL（クエリ維持）
      const target = new URL(GEN2_BASE_URL);
      target.pathname = forwardedPath;
      target.search = u.search;

      // headers 構築
      const headers = new Headers();
      for (const [k, v] of Object.entries(req.headers)) {
        if (typeof v === "string") headers.set(k, v);
        else if (Array.isArray(v)) headers.set(k, v.join(","));
      }

      // hop-by-hop headers は落とす（安全）
      headers.delete("host");
      headers.delete("connection");
      headers.delete("content-length");

      // 追加で「元のホスト」を渡したければ（任意）
      headers.set("x-forwarded-host", req.headers.host || "");
      headers.set("x-forwarded-proto", "https");

      const method = (req.method || "GET").toUpperCase();

      // rawBody は Firebase Functions(Express) で利用できることが多い
      const body =
        method === "GET" || method === "HEAD" ? undefined : (req as any).rawBody;

      console.log(`Proxying to ${target.toString()}`,{
        method,
        headers,
        body,
        redirect: "manual",
      });
      const r = await fetch(target.toString(), {
        method,
        headers,
        body,
        redirect: "manual",
      });

      // status
      res.status(r.status);

      // response headers
      r.headers.forEach((value, key) => {
        const lk = key.toLowerCase();
        if (lk === "transfer-encoding") return;
        // location が返る場合に Cloud Run 側URLが露出するのが嫌なら書き換える等（必要なら）
        res.setHeader(key, value);
      });

      // body
      const ab = await r.arrayBuffer();
      res.send(Buffer.from(ab));
    } catch (e: any) {
      console.error("proxy error:", e);
      res.status(502).send(`Proxy error: ${e?.message || String(e)}`);
    }
  });
