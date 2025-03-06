"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const constants_1 = require("./constants");
const port = constants_1.variables.port || 4000;
app_1.default.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
app_1.default.get('/', (req, res) => {
    res.json({ message: "Backend is healthy" });
});
