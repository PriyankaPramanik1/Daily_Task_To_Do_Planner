import { categoryModel } from "../models/categoryModel";
import { CategoryInterface } from "../interface/category.interface";
import mongoose from "mongoose";

class CategoryRepository {
    async createCategory(data: { user: string | mongoose.Types.ObjectId; name: string; description?: string; }) {
        try {
            const category = new categoryModel({
                user: data.user,
                name: data.name,
                description: data.description,
            } as Partial<CategoryInterface>);
            return await category.save();
        } catch (err: any) {
            console.error("Error creating category:", err.message);
            throw new Error("Failed to create category");
        }
    }

    async updateCategory(id: string, payload: Partial<CategoryInterface>) {
        try {
            return await categoryModel.findByIdAndUpdate(id, payload, { new: true });
        } catch (err: any) {
            console.error("Error updating category:", err.message);
            throw new Error("Failed to update category");
        }
    }

    async deleteCategory(id: string) {
        try {
            return await categoryModel.findByIdAndDelete(id);
        } catch (err: any) {
            console.error("Error deleting category:", err.message);
            throw new Error("Failed to delete category");
        }
    }

    async findById(id: string) {
        try {
            return await categoryModel.findById(id);
        } catch (err: any) {
            console.error("Error finding category by id:", err.message);
            throw new Error("Failed to find category");
        }
    }

    async listByUser(userId: string) {
        try {
            return await categoryModel.find({ user: userId }).sort({ createdAt: -1 });
        } catch (err: any) {
            console.error("Error listing categories:", err.message);
            throw new Error("Failed to list categories");
        }
    }
}

const categoryRepository = new CategoryRepository();
export { categoryRepository };
