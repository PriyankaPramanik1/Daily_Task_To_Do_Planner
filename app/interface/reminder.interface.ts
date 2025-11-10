import mongoose from "mongoose";

export interface ReminderInterface {
    user: mongoose.Types.ObjectId;
    task: mongoose.Types.ObjectId;
    reminderTime: Date;
    reminderType: "notification" | "email" | "both";
    repeat: "none" | "daily" | "weekly" | "monthly";
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
