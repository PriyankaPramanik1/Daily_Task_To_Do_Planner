import express from "express";
import LabelController from "../controllers/labelController";
import { protect } from "../middleware/auth.middleware"; 

const labelRouter = express.Router();

labelRouter.post("/add/label", protect, LabelController.addLabel);
labelRouter.get("/list/lable", protect, LabelController.listLabels);

export {labelRouter};
