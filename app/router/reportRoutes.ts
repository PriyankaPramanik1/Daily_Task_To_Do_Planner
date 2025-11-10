import express from "express";
import { protect } from "../middleware/auth.middleware";
import { reportController } from "../controllers/reportController";

const reposrRouter = express.Router();

reposrRouter.get("/report/summary", protect, reportController.getTaskSummary);
reposrRouter.get("/report/statistics", protect, reportController.getTaskStatistics);
reposrRouter.post("/report/email-summary", protect, reportController.sendEmailSummary);

export {reposrRouter};
