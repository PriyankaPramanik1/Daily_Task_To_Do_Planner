import { labelModel } from "../models/labelModel";
import { LabelInterface } from "../interface/label.interface";
import mongoose from "mongoose";

class LabelRepository {
    async createLabel(data: { user: string | mongoose.Types.ObjectId; name: string; }) {
        try {
            const label = new labelModel({
                user: data.user,
                name: data.name,
            } as Partial<LabelInterface>);
            return await label.save();
        } catch (err: any) {
            console.error("Error creating label:", err.message);
            throw new Error("Failed to create label");
        }
    }

    async findById(id: string) {
        try {
            return await labelModel.findById(id);
        } catch (err: any) {
            console.error("Error finding label by id:", err.message);
            throw new Error("Failed to find label");
        }
    }

    async listByUser(userId: string) {
        try {
            return await labelModel.find({ user: userId }).sort({ createdAt: -1 });
        } catch (err: any) {
            console.error("Error listing labels:", err.message);
            throw new Error("Failed to list labels");
        }
    }

    async deleteLabel(id: string) {
        try {
            return await labelModel.findByIdAndDelete(id);
        } catch (err: any) {
            console.error("Error deleting label:", err.message);
            throw new Error("Failed to delete label");
        }
    }

    async updateLabel(id: string, payload: Partial<LabelInterface>) {
        try {
            return await labelModel.findByIdAndUpdate(id, payload, { new: true });
        } catch (err: any) {
            console.error("Error updating label:", err.message);
            throw new Error("Failed to update label");
        }
    }
}

const labelRepository = new LabelRepository();
export { labelRepository };
