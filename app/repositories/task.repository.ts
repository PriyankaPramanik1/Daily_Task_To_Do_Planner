import { TaskModel } from "../models/taskModel";
import { TaskInterface } from "../interface/task.interface";
import mongoose, { PipelineStage } from "mongoose";
import { categoryModel } from "../models/categoryModel";
import { labelModel } from "../models/labelModel";

class TaskRepositories {
    // Add Task
    async createTask(data: TaskInterface) {
        try {
            const task = new TaskModel(data);
            return await task.save();
        } catch (error: any) {
            console.error("Error creating task:", error.message);
            throw new Error("Failed to create task");
        }
    }

    // Edit Task
    async updateTask(id: string, payload: Partial<TaskInterface>) {
        try {
            return await TaskModel.findByIdAndUpdate(id, payload, { new: true });
        } catch (error: any) {
            console.error("Error updating task:", error.message);
            throw new Error("Failed to update task");
        }
    }

    // Delete Task
    async deleteTask(id: string) {
        try {
            return await TaskModel.findByIdAndDelete(id);
        } catch (error: any) {
            console.error("Error deleting task:", error.message);
            throw new Error("Failed to delete task");
        }
    }

    // Mark Completed
    async markCompleted(id: string) {
        try {
            return await TaskModel.findByIdAndUpdate(id, { status: "Completed" }, { new: true });
        } catch (error: any) {
            console.error("Error marking task completed:", error.message);
            throw new Error("Failed to mark completed");
        }
    }

    // List tasks with filters
    // async listTasks(userId: string, filters: any) {
    //     try {
    //         const query: any = { user: userId };

    //         if (filters.status) query.status = filters.status;
    //         if (filters.categoryId) query.categoryId = filters.categoryId;
    //         if (filters.labels) query.labels = { $in: filters.labels };

    //         // Filter by dueDate range
    //         if (filters.dueDateStart && filters.dueDateEnd) {
    //             query.dueDate = { $gte: filters.dueDateStart, $lte: filters.dueDateEnd };
    //         }

    //         return await TaskModel.find(query).sort({ order: 1, dueDate: 1 });
    //     } catch (error: any) {
    //         console.error("Error listing tasks:", error.message);
    //         throw new Error("Failed to list tasks");
    //     }
    // }

    // async listTasks(userId: string, filters: any) {
    //     try {
    //         const matchStage: any = { user: new mongoose.Types.ObjectId(userId) };

    //         if (filters.status) matchStage.status = filters.status;
    //         if (filters.categoryId) matchStage.categoryId = new mongoose.Types.ObjectId(filters.categoryId);
    //         if (filters.labels) matchStage.labels = { $in: filters.labels.map((id: string) => new mongoose.Types.ObjectId(id)) };

    //         const tasks = await TaskModel.aggregate([
    //             { $match: matchStage },
    //             {
    //                 $lookup: {
    //                     from: "categories",
    //                     localField: "categoryId",
    //                     foreignField: "_id",
    //                     as: "categoryInfo"
    //                 }
    //             },
    //             { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
    //             {
    //                 $lookup: {
    //                     from: "labels",
    //                     localField: "labels",
    //                     foreignField: "_id",
    //                     as: "labelInfo"
    //                 }
    //             },
    //             { $sort: { order: 1, dueDate: 1 } }
    //         ]);

    //         return tasks;
    //     } catch (error: any) {
    //         console.error("Error listing tasks:", error.message);
    //         throw new Error("Failed to list tasks");
    //     }
    // }

    async listTasks(userId: string, filters: {
        status?: string;
        categoryId?: string;
        labels?: string[] | string;
        dueDateStart?: string;
        dueDateEnd?: string;
    }) {
        try {
            
            const matchCriteria: Record<string, any> = {
                user: new mongoose.Types.ObjectId(userId)
            };

            // Status filter
            if (filters.status && ['Pending', 'Completed'].includes(filters.status)) {
                matchCriteria.status = filters.status;
            }

            // Category filter
            if (filters.categoryId && mongoose.Types.ObjectId.isValid(filters.categoryId)) {
                matchCriteria.categoryId = new mongoose.Types.ObjectId(filters.categoryId);
            }

            // Labels filter
            if (filters.labels) {
                const labelIds = Array.isArray(filters.labels)
                    ? filters.labels
                    : [filters.labels];

                const validLabelIds = labelIds
                    .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
                    .map((id: string) => new mongoose.Types.ObjectId(id));

                if (validLabelIds.length > 0) {
                    matchCriteria.labels = { $in: validLabelIds };
                }
            }

            // Due date filter
            if (filters.dueDateStart && filters.dueDateEnd) {
                matchCriteria.dueDate = {
                    $gte: new Date(filters.dueDateStart),
                    $lte: new Date(filters.dueDateEnd),
                };
            }

            // Define pipeline
            const pipeline: PipelineStage[] = [
                // Match documents
                { $match: matchCriteria },

                //  Lookup category
                {
                    $lookup: {
                        from: "categories",
                        localField: "categoryId",
                        foreignField: "_id",
                        as: "category",
                    }
                },

                // Unwind category array
                {
                    $unwind: {
                        path: "$category",
                        preserveNullAndEmptyArrays: true
                    }
                },

                // Lookup labels - FIXED VERSION
                {
                    $lookup: {
                        from: "labels",
                        let: { labelIds: "$labels" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $in: ["$_id", "$$labelIds"]
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    name: 1
                                }
                            }
                        ],
                        as: "labels",
                    }
                },

                // Sort tasks
                {
                    $sort: {
                        order: 1,
                        dueDate: 1
                    }
                },

                // Project final shape
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        description: 1,
                        priority: 1,
                        dueDate: 1,
                        status: 1,
                        order: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        user: 1,
                        category: {
                            $cond: {
                                if: { $ne: ["$category", null] },
                                then: {
                                    _id: "$category._id",
                                    name: "$category.name",
                                    description: "$category.description",
                                },
                                else: null
                            }
                        },
                        labels: 1
                    }
                }
            ];

            const tasks = await TaskModel.aggregate(pipeline);
            return tasks;
        } catch (error: any) {
            console.error("Error listing tasks:", error.message);
            throw new Error("Failed to list tasks");
        }
    }


    // Reorder Tasks
    async reorderTasks(taskOrders: { id: string; order: number }[]) {
        try {
            const bulkOps = taskOrders.map(t => ({
                updateOne: {
                    filter: { _id: t.id },
                    update: { $set: { order: t.order } },
                },
            }));
            await TaskModel.bulkWrite(bulkOps);
            return { message: "Tasks reordered successfully" };
        } catch (error: any) {
            console.error("Error reordering tasks:", error.message);
            throw new Error("Failed to reorder tasks");
        }
    }
}

export const taskRepositories = new TaskRepositories();
