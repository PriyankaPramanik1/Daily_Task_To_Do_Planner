import mongoose, { Schema, Document } from "mongoose";
import { ReminderInterface } from "../interface/reminder.interface";

const reminderSchema = new Schema<ReminderInterface>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        task: {
            type: Schema.Types.ObjectId,
            ref: "task",
            required: true
        },
        reminderTime: {
            type: Date,
            required: true
        },
        reminderType: {
            type: String,
            enum: ["notification", "email", "both"],
            default: "notification"
        },
        repeat: {
            type: String,
            enum: ["none", "daily", "weekly", "monthly"],
            default: "none"
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

// // Compound index for better query performance
// reminderSchema.index({ user: 1, task: 1 });
// reminderSchema.index({ reminderTime: 1 });
// reminderSchema.index({ isActive: 1 });

export const ReminderModel = mongoose.model<ReminderInterface>("Reminder", reminderSchema);