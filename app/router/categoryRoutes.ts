import express from "express";
import CategoryController from "../controllers/categoryController";
import { protect } from "../middleware/auth.middleware"; 


const categoryRouter = express.Router();

categoryRouter.post("/add/category", protect, CategoryController.addCategory);
categoryRouter.put("/edit/category/:id", protect, CategoryController.editCategory);
categoryRouter.delete("/delete/category/:id", protect, CategoryController.deleteCategory);
categoryRouter.get("/list/category", protect, CategoryController.listCategories);

export {categoryRouter};
