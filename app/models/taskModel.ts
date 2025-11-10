import mongoose, { Schema } from "mongoose";
import Joi from "joi";
import { TaskInterface } from "../interface/task.interface";

export const taskSchemaValidation = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().optional(),
    priority: Joi.string().valid("Low", "Medium", "High").required(),
    dueDate: Joi.date().iso().greater('now').optional(),

    categoryId: Joi.string().hex().length(24).optional(),
    labels: Joi.array().items(Joi.string().hex().length(24)).optional(),

    // categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    // labels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Label" }],

    status: Joi.string().valid("Pending", "Completed").default("Pending"),
    order: Joi.number().integer().min(0).default(0)
});

const taskSchema = new Schema<TaskInterface>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String

        },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            required: true
        },
        dueDate: {
            type: Date,
            required: true
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: "Category"
        },
        labels: [{
            type: Schema.Types.ObjectId,
            ref: "Label"
        }],
        status: {
            type: String,
            enum: ["Pending", "Completed"],
            default: "Pending"
        },
        order: {
            type: Number,
            default: 0
        },
    },
    { timestamps: true }
);

taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, status: 1 });

export const TaskModel = mongoose.model<TaskInterface>("task", taskSchema);
