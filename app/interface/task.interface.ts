import mongoose from "mongoose";

export interface TaskInterface {
    user: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    priority: "Low" | "Medium" | "High";
    dueDate?: Date;
    categoryId?: mongoose.Types.ObjectId;
    labels?: mongoose.Types.ObjectId[];
    status: "Pending" | "Completed";
    order?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
