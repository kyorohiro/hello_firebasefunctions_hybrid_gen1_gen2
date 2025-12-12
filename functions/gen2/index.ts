import { setGlobalOptions } from "firebase-functions/v2";
import { onRequest } from "firebase-functions/v2/https";
import { createHelloApp } from "../src/express_app";
//import { writeSystemLog } from "../../src/log";

setGlobalOptions({ region: "asia-northeast1" });

// ✅ Express Router (V2)
export const helloV2 = onRequest({ invoker: "public" }, createHelloApp());

// （おまけ）V2でも動作確認ログを残したいなら：
// createHelloApp() 側で writeSystemLog を呼ぶのは簡単だけど、
// HelloWorldが遅くなるのでここでは別endpointにしてもOK。
/*
export const pingLogV2 = onRequest({ invoker: "public" }, async (req, res) => {
    await writeSystemLog("ping_v2", { ua: req.get("user-agent") ?? null });
    res.status(200).send("logged");
});
*/