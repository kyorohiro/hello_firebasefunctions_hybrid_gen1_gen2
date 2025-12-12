import express from "express";

export function createHelloApp() {
    const app = express();

    const router = express.Router();
    router.get("/hello", (req, res) => {
        res.json({ ok: true, message: "Hello", now: new Date().toISOString() });
    });

    router.get("/world", (req, res) => {
        res.json({ ok: true, message: "World", now: new Date().toISOString() });
    });

    app.use(router);
    return app;
}