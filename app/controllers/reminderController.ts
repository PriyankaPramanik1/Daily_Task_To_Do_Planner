import { Request, Response } from "express";
import mongoose from "mongoose";
import { reminderRepositories } from "../repositories/reminder.repository";


class ReminderController {
    // Set Reminder for Task
    async setReminder(req: Request, res: Response): Promise<any> {
        try {
            const { taskId, reminderTime, reminderType, repeat } = req.body;
            const userId = (req as any).user?.userId;


            if (!userId)
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });

            if (!taskId || !reminderTime)
                return res.status(400).json({
                    success: false,
                    message: "Task ID and reminder time are required"
                });

            const existingReminder = await reminderRepositories.isReminderExists(userId, taskId);
            if (existingReminder)
                return res.status(400).json({
                    success: false,
                    message: "Reminder already exists for this task"
                });

            const reminderDateTime = new Date(reminderTime);
            if (isNaN(reminderDateTime.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid reminder time format"
                });
            }
            // Validate reminder time
            // const reminderDateTime = new Date(reminderTime);
            if (reminderDateTime <= new Date()) {
                return res.status(400).json({
                    success: false,
                    message: "Reminder time must be in the future"
                });
            }

            const reminderData = {
                user: new mongoose.Types.ObjectId(userId),
                task: new mongoose.Types.ObjectId(taskId),
                reminderTime: reminderDateTime,
                reminderType: reminderType || "notification",
                repeat: repeat || "none",
                isActive: true
            };

            const reminder = await reminderRepositories.createReminder(reminderData);

            return res.status(201).json({
                success: true,
                message: "Reminder set successfully",
                data: reminder
            });

        } catch (error: any) {
            console.error("Error setting reminder:", error);
            return res.status(500).json({
                success: false,
                message: "Server error setting reminder",
                error: error.message
            });
        }
    }

    // Edit Reminder
    async editReminder(req: Request, res: Response): Promise<any> {
        console.log("Edit Remondet ", req.body);

        try {
            const { id } = req.params;
            const updateData = req.body;
            const userId = (req as any).user?.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }
            console.log("loggedInUser:", userId);


            // Check reminder
            const existingReminder = await reminderRepositories.findReminderById(id);
            console.log("existingReminder.user:", existingReminder.user.toString());

            if (!existingReminder) {
                return res.status(404).json({
                    success: false,
                    message: "Reminder not found"
                });
            }

            const reminderUserId = existingReminder.user?._id?.toString() || existingReminder.user?.toString();

            if (reminderUserId !== userId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }

            // Validate reminder time
            if (updateData.reminderTime) {
                const reminderDateTime = new Date(updateData.reminderTime);
                if (reminderDateTime <= new Date()) {
                    return res.status(400).json({
                        success: false,
                        message: "Reminder time must be in the future"
                    });
                }
                updateData.reminderTime = reminderDateTime;
            }

            const updatedReminder = await reminderRepositories.updateReminder(id, updateData);

            return res.status(200).json({
                success: true,
                message: "Reminder updated successfully",
                data: updatedReminder
            });

        } catch (error: any) {
            console.error("Error editing reminder:", error);
            return res.status(500).json({
                success: false,
                message: "Server error updating reminder",
                error: error.message
            });
        }
    }

    // Delete Reminder
    async deleteReminder(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const userId = (req as any).user?.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            // Check reminder
            const existingReminder = await reminderRepositories.findReminderById(id);
            if (!existingReminder) {
                return res.status(404).json({
                    success: false,
                    message: "Reminder not found"
                });
            }

            const reminderUserId = existingReminder.user?._id?.toString() || existingReminder.user?.toString();

            if (reminderUserId !== userId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }

            await reminderRepositories.deleteReminder(id);

            return res.status(200).json({
                success: true,
                message: "Reminder deleted successfully"
            });

        } catch (error: any) {
            console.error("Error deleting reminder:", error);
            return res.status(500).json({
                success: false,
                message: "Server error deleting reminder",
                error: error.message
            });
        }
    }

}

export default new ReminderController();