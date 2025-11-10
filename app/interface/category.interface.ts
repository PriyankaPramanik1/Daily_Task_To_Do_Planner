import mongoose from "mongoose";

export interface CategoryInterface  {
  user: mongoose.Types.ObjectId;
  name: string;
  description?: string;
}
