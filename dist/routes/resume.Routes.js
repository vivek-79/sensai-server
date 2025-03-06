"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const resume_controller_1 = require("../controller/resume.controller");
const authenticated_1 = require("../middleware/authenticated");
const resumeRouter = (0, express_1.Router)();
resumeRouter.use(authenticated_1.authenticateUser);
resumeRouter.route('/save').post(resume_controller_1.saveResume);
resumeRouter.route('/get').get(resume_controller_1.getResume);
resumeRouter.route('/improve').post(resume_controller_1.improveWithAi);
resumeRouter.route('/delete').get(resume_controller_1.deleteResume);
exports.default = resumeRouter;
