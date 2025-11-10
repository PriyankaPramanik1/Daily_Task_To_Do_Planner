import { ReminderModel } from "../models/reminderModel";
import { ReminderInterface } from "../interface/reminder.interface";
import mongoose, { PipelineStage } from "mongoose";

class ReminderRepository {
    // Create Reminder
    async createReminder(data: ReminderInterface) {
        try {
            const reminder = new ReminderModel(data);
            return await reminder.save();
        } catch (error: any) {
            console.error("Error creating reminder:", error.message);
            throw new Error("Failed to create reminder");
        }
    }

    // Update Reminder
    async updateReminder(id: string, payload: Partial<ReminderInterface>) {
        try {
            return await ReminderModel.findByIdAndUpdate(
                id,
                payload,
                { new: true, runValidators: true }
            );
        } catch (error: any) {
            console.error("Error updating reminder:", error.message);
            throw new Error("Failed to update reminder");
        }
    }

    // Delete Reminder
    async deleteReminder(id: string) {
        try {
            return await ReminderModel.findByIdAndDelete(id);
        } catch (error: any) {
            console.error("Error deleting reminder:", error.message);
            throw new Error("Failed to delete reminder");
        }
    }

    // Find Reminder by ID
    async findReminderById(id: string) {
        try {
            const pipeline: PipelineStage[] = [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id)
                    }
                },
                // Lookup task details
                {
                    $lookup: {
                        from: "tasks",
                        localField: "task",
                        foreignField: "_id",
                        as: "task"
                    }
                },
                {
                    $unwind: {
                        path: "$task",
                        preserveNullAndEmptyArrays: true
                    }
                },
                // Lookup use
                {
                    $lookup: {
                        from: "users",
                        localField: "user",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: {
                        path: "$user",
                        preserveNullAndEmptyArrays: true
                    }
                },
                // Project only required fields
                {
                    $project: {
                        _id: 1,
                        reminderTime: 1,
                        reminderType: 1,
                        repeat: 1,
                        isActive: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        task: {
                            _id: "$task._id",
                            title: "$task.title",
                            description: "$task.description",
                            dueDate: "$task.dueDate"
                        },
                        user: {
                            _id: "$user._id",
                            name: "$user.name",
                            email: "$user.email"
                        }
                    }
                }
            ];

            const result = await ReminderModel.aggregate(pipeline);
            return result[0] || null;
        } catch (error: any) {
            console.error("Error finding reminder:", error.message);
            throw new Error("Failed to find reminder");
        }
    }


    // Check if reminder already exists for task
    async isReminderExists(userId: string, taskId: string) {
        try {
            const reminder = await ReminderModel.findOne({
                user: new mongoose.Types.ObjectId(userId),
                task: new mongoose.Types.ObjectId(taskId),
                isActive: true
            });
            return !!reminder;
        } catch (error: any) {
            console.error("Error checking reminder existence:", error.message);
            throw new Error("Failed to check reminder existence");
        }
    }


}

export const reminderRepositories = new ReminderRepository();