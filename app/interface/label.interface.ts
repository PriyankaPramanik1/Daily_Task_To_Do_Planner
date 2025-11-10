import mongoose from "mongoose";

export interface LabelInterface {
    user: mongoose.Types.ObjectId;
    name: string;
}