import mongoose, { Schema, Document } from "mongoose";
import { CategoryInterface } from "../interface/category.interface";


const categorySchema = new Schema<CategoryInterface>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: { type: String },
    },
    { timestamps: true }
);

export const categoryModel = mongoose.model<CategoryInterface>("Category", categorySchema);
