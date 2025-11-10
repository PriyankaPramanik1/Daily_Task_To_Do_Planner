import mongoose, { Schema, Document } from "mongoose";
import { LabelInterface } from "../interface/label.interface";

const labelSchema = new Schema<LabelInterface>(
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
    },
    { timestamps: true }
);

export const labelModel = mongoose.model<LabelInterface>("Label", labelSchema);
