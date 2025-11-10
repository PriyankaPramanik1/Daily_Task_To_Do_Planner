import { Request, Response } from "express";
import { taskRepositories } from "../repositories/task.repository";
import { taskSchemaValidation } from "../models/taskModel";
import mongoose, { mongo } from "mongoose";

class TaskController {

    // Add Task
    async addTask(req: Request, res: Response): Promise<void> {
        try {
            const { error, value } = taskSchemaValidation.validate(req.body);
            if (error) {
                res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
                return;
            }

            const userId = (req as any).user.userId;

            const taskData = {
                ...value,
                user: userId,
                categoryId: value.categoryId ? new mongoose.Types.ObjectId(value.categoryId) : undefined,
                labels: value.labels ? value.labels.map((id: string) => new mongoose.Types.ObjectId(id)) : [],

            };

            const task = await taskRepositories.createTask(taskData);

            res.status(201).json({
                success: true,
                message: "Task created successfully",
                data: task
            });

        } catch (err: any) {
            console.error("Add task error:", err.message);
            res.status(500).json({ success: false, message: "Server error creating task" });
        }
    }

    // Edit Task
    async editTask(req: Request, res: Response): Promise<void> {
        try {
            const taskId = req.params.id;
            const updatedTask = await taskRepositories.updateTask(taskId, req.body);
            if (!updatedTask) {
                res.status(404).json({ success: false, message: "Task not found" });
                return;
            }
            res.status(200).json({ success: true, message: "Task updated", data: updatedTask });
        } catch (err: any) {
            console.error("Edit task error:", err.message);
            res.status(500).json({ success: false, message: "Failed to edit task" });
        }
    }

    // Delete Task
    async deleteTask(req: Request, res: Response): Promise<void> {
        try {
            const taskId = req.params.id;
            const deleted = await taskRepositories.deleteTask(taskId);
            if (!deleted) {
                res.status(404).json({ success: false, message: "Task not found" });
                return;
            }
            res.status(200).json({ success: true, message: "Task deleted successfully" });
        } catch (err: any) {
            console.error("Delete task error:", err.message);
            res.status(500).json({ success: false, message: "Failed to delete task" });
        }
    }

    // Mark Completed
    async markCompleted(req: Request, res: Response): Promise<void> {
        try {
            const taskId = req.params.id;
            const updated = await taskRepositories.markCompleted(taskId);
            if (!updated) {
                res.status(404).json({ success: false, message: "Task not found" });
                return;
            }
            res.status(200).json({ success: true, message: "Task marked as completed", data: updated });
        } catch (err: any) {
            console.error("Mark completed error:", err.message);
            res.status(500).json({ success: false, message: "Failed to mark completed" });
        }
    }

    // List Tasks with filters
    async listTasks(req: Request, res: Response): Promise<void> {
        try {

            const userId = (req as any).user.userId;

            const filters = req.query;
            const tasks = await taskRepositories.listTasks(userId, filters);
            res.status(200).json({ success: true, count: tasks.length, data: tasks });
        } catch (err: any) {
            console.error("List tasks error:", err.message);
            res.status(500).json({ success: false, message: "Failed to fetch tasks" });
        }
    }

    // Reorder Tasks
    async reorderTasks(req: Request, res: Response): Promise<void> {
        try {
            const { taskOrders } = req.body; // [{id, order}]
            const result = await taskRepositories.reorderTasks(taskOrders);
            res.status(200).json({ success: true, message: result.message });
        } catch (err: any) {
            console.error("Reorder tasks error:", err.message);
            res.status(500).json({ success: false, message: "Failed to reorder tasks" });
        }
    }
}

export const taskController = new TaskController();
