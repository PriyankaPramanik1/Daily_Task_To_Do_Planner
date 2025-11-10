import mongoose from "mongoose";

export interface TaskSummary {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    completionRate: number;
    period: string;
}

export interface TaskStatistics {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    completionRate: number;
    averageCompletionTime: number;
    productivityScore: number;
    tasksByPriority: {
        high: number;
        medium: number;
        low: number;
    };
    tasksByCategory: Array<{
        category: string;
        count: number;
        completed: number;
    }>;
}

export interface EmailSummaryRequest {
    email: string;
    period: "daily" | "weekly";
    includeOverdue: boolean;
    includeUpcoming: boolean;
    includeCompleted: boolean;
}

export interface TaskTrend {
    date: string;
    total: number;
    completed: number;
    pending: number;
}