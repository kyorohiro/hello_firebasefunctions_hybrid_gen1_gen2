import express from "express";

export function createHelloApp(message?: string) {
    const app = express();

    const router = express.Router();
    router.get("/hello", (req, res) => {
        res.json({ ok: true, message: `Hello ${message ?? ""}`, now: new Date().toISOString() });
    });

    router.get("/world", (req, res) => {
        res.json({ ok: true, message: `World ${message ?? ""}`, now: new Date().toISOString() });
    });

    app.use(router);
    return app;
}