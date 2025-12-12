"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_app_1 = require("./express_app");
const helloApp = (0, express_app_1.createHelloApp)();
helloApp.listen(3000, () => {
    console.log("Hello app is running on http://localhost:3000");
});
//# sourceMappingURL=main.js.map