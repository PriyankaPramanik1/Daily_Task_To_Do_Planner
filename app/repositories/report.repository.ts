import { TaskModel } from "../models/taskModel";
import { TaskSummary, TaskStatistics, TaskTrend } from "../interface/report.interface";
import mongoose, { PipelineStage } from "mongoose";

class ReportRepository {
    
    // Task Summary for Day/Week
    async getTaskSummary(userId: string, period: "day" | "week" | "month"): Promise<TaskSummary> {
        try {
            const { startDate, endDate } = this.getDateRange(period);
            const now = new Date();

            const pipeline: PipelineStage[] = [
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(userId),
                        // dueDate: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $facet: {
                        totalTasks: [{ $count: "count" }],
                        completedTasks: [
                            { $match: { status: "Completed" } },
                            { $count: "count" }
                        ],
                        pendingTasks: [
                            { $match: { status: "Pending" } },
                            { $count: "count" }
                        ],
                        overdueTasks: [
                            { 
                                $match: { 
                                    status: "Pending", 
                                    dueDate: { $lt: now } 
                                } 
                            },
                            { $count: "count" }
                        ]
                    }
                }
            ];

            const result = await TaskModel.aggregate(pipeline);
            const data = result[0];

            const total = data.totalTasks[0]?.count || 0;
            const completed = data.completedTasks[0]?.count || 0;
            const pending = data.pendingTasks[0]?.count || 0;
            const overdue = data.overdueTasks[0]?.count || 0;
            const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

            return {
                totalTasks: total,
                completedTasks: completed,
                pendingTasks: pending,
                overdueTasks: overdue,
                completionRate: completionRate,
                period: period
            };

        } catch (error: any) {
            console.error("Error getting task summary:", error.message);
            throw new Error("Failed to get task summary");
        }
    }

    // Task Statistics
    async getTaskStatistics(userId: string): Promise<TaskStatistics> {
        try {
            const pipeline: PipelineStage[] = [
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $facet: {
                        // Basic counts
                        basicStats: [
                            {
                                $group: {
                                    _id: null,
                                    totalTasks: { $sum: 1 },
                                    completedTasks: {
                                        $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
                                    },
                                    pendingTasks: {
                                        $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] }
                                    },
                                    overdueTasks: {
                                        $sum: {
                                            $cond: [
                                                { 
                                                    $and: [
                                                        { $eq: ["$status", "Pending"] },
                                                        { $lt: ["$dueDate", new Date()] }
                                                    ]
                                                }, 1, 0
                                            ]
                                        }
                                    }
                                }
                            }
                        ],
                        // Tasks by priority
                        priorityStats: [
                            {
                                $group: {
                                    _id: "$priority",
                                    count: { $sum: 1 }
                                }
                            }
                        ],
                        // Tasks by category
                        categoryStats: [
                            {
                                $lookup: {
                                    from: "categories",
                                    localField: "categoryId",
                                    foreignField: "_id",
                                    as: "category"
                                }
                            },
                            {
                                $unwind: {
                                    path: "$category",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $group: {
                                    _id: "$category.name",
                                    total: { $sum: 1 },
                                    completed: {
                                        $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
                                    }
                                }
                            }
                        ],
                        // Average completion time
                        completionTime: [
                            {
                                $match: {
                                    status: "Completed",
                                    createdAt: { $exists: true },
                                    updatedAt: { $exists: true }
                                }
                            },
                            {
                                $addFields: {
                                    completionTimeHours: {
                                        $divide: [
                                            { $subtract: ["$updatedAt", "$createdAt"] },
                                            1000 * 60 * 60 // Convert to hours
                                        ]
                                    }
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    avgCompletionTime: { $avg: "$completionTimeHours" }
                                }
                            }
                        ]
                    }
                }
            ];

            const result = await TaskModel.aggregate(pipeline);
            const data = result[0];

            const basicStats = data.basicStats[0] || {
                totalTasks: 0, completedTasks: 0, pendingTasks: 0, overdueTasks: 0
            };

            const completionTime = data.completionTime[0] || { avgCompletionTime: 0 };

            // Process priority stats
            const priorityStats = { high: 0, medium: 0, low: 0 };
            data.priorityStats.forEach((stat: any) => {
                const priority = stat._id.toLowerCase() as keyof typeof priorityStats;
                priorityStats[priority] = stat.count;
            });

            // Process category stats
            const categoryStats = data.categoryStats.map((stat: any) => ({
                category: stat._id || "Uncategorized",
                count: stat.total,
                completed: stat.completed
            }));

            const completionRate = basicStats.totalTasks > 0 
                ? Math.round((basicStats.completedTasks / basicStats.totalTasks) * 100) 
                : 0;

            // Calculate productivity score
            const productivityScore = Math.min(
                Math.round((completionRate / 100) * (basicStats.completedTasks / (basicStats.overdueTasks + 1)) * 50),
                100
            );

            return {
                totalTasks: basicStats.totalTasks,
                completedTasks: basicStats.completedTasks,
                pendingTasks: basicStats.pendingTasks,
                overdueTasks: basicStats.overdueTasks,
                completionRate: completionRate,
                averageCompletionTime: Math.round(completionTime.avgCompletionTime * 100) / 100,
                productivityScore: productivityScore,
                tasksByPriority: priorityStats,
                tasksByCategory: categoryStats
            };

        } catch (error: any) {
            console.error("Error getting task statistics:", error.message);
            throw new Error("Failed to get task statistics");
        }
    }

    // Get tasks for email summary
    async getTasksForEmailSummary(userId: string, period: "daily" | "weekly") {
        try {
            const now = new Date();
            let startDate: Date, endDate: Date;

            if (period === "daily") {
                startDate = new Date(now.setHours(0, 0, 0, 0));
                endDate = new Date(now.setHours(23, 59, 59, 999));
            } else {
                // Weekly - get tasks from last 7 days
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                endDate = new Date();
            }

            const pipeline: PipelineStage[] = [
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $facet: {
                        // Overdue tasks
                        overdueTasks: [
                            {
                                $match: {
                                    status: "Pending",
                                    dueDate: { $lt: now }
                                }
                            },
                            {
                                $project: {
                                    title: 1,
                                    dueDate: 1,
                                    priority: 1,
                                    description: 1
                                }
                            }
                        ],
                        // Upcoming tasks (next 3 days)
                        upcomingTasks: [
                            {
                                $match: {
                                    status: "Pending",
                                    dueDate: { 
                                        $gte: now, 
                                        $lte: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) 
                                    }
                                }
                            },
                            {
                                $project: {
                                    title: 1,
                                    dueDate: 1,
                                    priority: 1,
                                    description: 1
                                }
                            }
                        ],
                        // Completed tasks in the period
                        completedTasks: [
                            {
                                $match: {
                                    status: "Completed",
                                    updatedAt: { $gte: startDate, $lte: endDate }
                                }
                            },
                            {
                                $project: {
                                    title: 1,
                                    dueDate: 1,
                                    priority: 1,
                                    description: 1,
                                    updatedAt: 1
                                }
                            }
                        ]
                    }
                }
            ];

            const result = await TaskModel.aggregate(pipeline);
            return result[0];

        } catch (error: any) {
            console.error("Error getting tasks for email summary:", error.message);
            throw new Error("Failed to get tasks for email summary");
        }
    }

    // Helper function to get date ranges
    private getDateRange(period: "day" | "week" | "month") {
        const now = new Date();
        let startDate: Date;
        let endDate: Date;

        switch (period) {
            case "day":
                startDate = new Date(now.setHours(0, 0, 0, 0));
                endDate = new Date(now.setHours(23, 59, 59, 999));
                break;
            case "week":
                startDate = new Date(now);
                // startDate.setDate(now.getDate() - now.getDay());
                startDate.setDate(now.getDate() -7); // Last 7 days
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 6);
                endDate.setHours(23, 59, 59, 999);
                break;
            case "month":
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                break;
            default:
                startDate = new Date(now.setHours(0, 0, 0, 0));
                endDate = new Date(now.setHours(23, 59, 59, 999));
        }

        return { startDate, endDate };
    }
}

export const reportRepositories = new ReportRepository();