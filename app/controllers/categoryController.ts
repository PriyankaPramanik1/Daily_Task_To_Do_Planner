import { Request, Response } from "express";
import { categoryRepository } from "../repositories/category.repository";

class CategoryController {
  // Add Category
  async addCategory(req: Request, res: Response): Promise<any> {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, message: "Category name is required" });
      }

      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }

      const category = await categoryRepository.createCategory({ user: userId, name, description });
      return res.status(201).json({ success: true, message: "Category created", data: category });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Edit Category
  async editCategory(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }

      const updatedCategory = await categoryRepository.updateCategory(id, { name, description }
      );

      if (!updatedCategory) {
        return res.status(404).json({ success: false, message: "Category not found" });
      }

      return res.status(200).json({ success: true, message: "Category updated", data: updatedCategory });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Delete Category
  async deleteCategory(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const deleted = await categoryRepository.deleteCategory(id);

      if (!deleted) {
        return res.status(404).json({ success: false, message: "Category not found" });
      }

      return res.status(200).json({ success: true, message: "Category deleted" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // List Categories
  async listCategories(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }

      const categories = await categoryRepository.listByUser(userId);
      return res.status(200).json({ success: true, data: categories });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new CategoryController();
