import { Request, Response } from "express";
import { labelModel } from "../models/labelModel";

class LabelController {
  // Add Label
  async addLabel(req: any, res: Response): Promise<any> {
    try {
      const { name } = req.body;
      const userId = req.user?.userId;

      if (!name) {
        return res.status(400).json({ success: false, message: "Label name is required" });
      }

      const label = await labelModel.create({ user: userId, name });
      return res.status(201).json({ success: true, message: "Label created", data: label });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // List Labels
  async listLabels(req: any, res: Response): Promise<any> {
    try {
      const userId = req.user?.userId;
      const labels = await labelModel.find({ user: userId }).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: labels });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new LabelController();
