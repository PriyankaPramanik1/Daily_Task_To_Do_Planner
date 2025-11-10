import { Request, Response } from "express";
import { reportRepositories } from "../repositories/report.repository";
import EmailService from "../utils/report.mail";

class ReportController {

    // Task Summary for Day/Week
    async getTaskSummary(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).user?.userId;
            const { period = "day" } = req.query;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            if (!["day", "week", "month"].includes(period as string)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid period. Use 'day', 'week', or 'month'"
                });
            }

            const summary = await reportRepositories.getTaskSummary(
                userId,
                period as "day" | "week" | "month"
            );

            return res.status(200).json({
                success: true,
                message: `Task summary for ${period} retrieved successfully`,
                data: summary
            });

        } catch (error: any) {
            console.error("Error getting task summary:", error);
            return res.status(500).json({
                success: false,
                message: "Server error getting task summary",
                error: error.message
            });
        }
    }

    // Task Statistics
    async getTaskStatistics(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).user?.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            const statistics = await reportRepositories.getTaskStatistics(userId);

            return res.status(200).json({
                success: true,
                message: "Task statistics retrieved successfully",
                data: statistics
            });

        } catch (error: any) {
            console.error("Error getting task statistics:", error);
            return res.status(500).json({
                success: false,
                message: "Server error getting task statistics",
                error: error.message
            });
        }
    }

    // Send Email Summary
    async sendEmailSummary(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).user?.userId;
            const userEmail = (req as any).user?.email;
            const userName = (req as any).user?.name;

            const {
                email = userEmail,
                period = "daily"
            } = req.body;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: "Email address is required"
                });
            }

            // Get task summary
            const summary = await reportRepositories.getTaskSummary(
                userId,
                period === "daily" ? "day" : "week"
            );

            // Get tasks for email
            const tasksData = await reportRepositories.getTasksForEmailSummary(
                userId,
                period as "daily" | "weekly"
            );

            // Send email
            const emailResult = await EmailService.sendTaskSummaryEmail(
                email,
                userName || "User",
                summary,
                tasksData,
                period
            );

            if (!emailResult.success) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to send email summary",
                    error: emailResult.error
                });
            }

            return res.status(200).json({
                success: true,
                message: `${period} task summary sent to ${email} successfully`,
                data: {
                    summary,
                    emailSent: true
                }
            });

        } catch (error: any) {
            console.error("Error sending email summary:", error);
            return res.status(500).json({
                success: false,
                message: "Server error sending email summary",
                error: error.message
            });
        }
    }
}

export const reportController = new ReportController();