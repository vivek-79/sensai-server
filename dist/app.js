"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const constants_1 = require("./constants");
const limiter_1 = require("./lib/limiter");
const express_2 = require("inngest/express");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: constants_1.variables.corsOrigin
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, limiter_1.limiter)({ window: 15, limit: 100 }));
//importing routes
const auth_Routes_1 = __importDefault(require("./routes/auth.Routes"));
const user_Routes_1 = __importDefault(require("./routes/user.Routes"));
const inngest_1 = require("./inngest");
const interview_routes_1 = __importDefault(require("./routes/interview.routes"));
const resume_Routes_1 = __importDefault(require("./routes/resume.Routes"));
app.use("/api/inngest", (0, express_2.serve)({ client: inngest_1.inngest, functions: inngest_1.functions }));
app.use('/api/v1/auth', auth_Routes_1.default);
app.use('/api/v1/user', user_Routes_1.default);
app.use('/api/v1/interview', interview_routes_1.default);
app.use('/api/v1/resume', resume_Routes_1.default);
exports.default = app;
