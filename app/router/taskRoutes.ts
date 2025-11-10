import express from "express";
import { taskController } from "../controllers/taskController";
import { protect } from "../middleware/auth.middleware"; 

const taskRouter = express.Router();

// All routes protected
taskRouter.post("/add/task", protect, taskController.addTask);
taskRouter.put("/edit/task/:id", protect, taskController.editTask);
taskRouter.delete("/delete/task/:id", protect, taskController.deleteTask);
taskRouter.get("/complete/task/:id", protect, taskController.markCompleted);
taskRouter.get("/list/task", protect, taskController.listTasks);
taskRouter.get("/reorder/task", protect, taskController.reorderTasks);

export { taskRouter };
