import express from "express";
import ReminderController from "../controllers/reminderController";
import { protect } from "../middleware/auth.middleware";

const reminderRouter = express.Router();

reminderRouter.post("/set/reminder", protect, ReminderController.setReminder);
reminderRouter.put("/edit/reminder/:id", protect, ReminderController.editReminder);
reminderRouter.delete("/delete/reminder/:id", protect, ReminderController.deleteReminder);


export { reminderRouter };