"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHelloApp = createHelloApp;
const express_1 = __importDefault(require("express"));
function createHelloApp() {
    const app = (0, express_1.default)();
    const router = express_1.default.Router();
    router.get("/hello", (req, res) => {
        res.json({ ok: true, message: "Hello", now: new Date().toISOString() });
    });
    router.get("/world", (req, res) => {
        res.json({ ok: true, message: "World", now: new Date().toISOString() });
    });
    app.use(router);
    return app;
}
//# sourceMappingURL=express_app.js.map