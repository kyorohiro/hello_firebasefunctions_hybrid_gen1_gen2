import { createHelloApp } from "./express_app";

const helloApp = createHelloApp();

helloApp.listen(3000, () => {
    console.log("Hello app is running on http://localhost:3000");
});
