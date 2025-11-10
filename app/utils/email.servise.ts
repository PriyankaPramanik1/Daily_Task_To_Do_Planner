import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    this.verifyTransporter();
  }

  private async verifyTransporter(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('✅ Email transporter is ready');
    } catch (error) {
      console.error('❌ Email transporter configuration error:', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
    try {
      const mailOptions = {
        from: `"Daily Task To-Do Planner" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error sending email:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  async sendVerificationEmail(email: string, token: string, name: string): Promise<{ success: boolean; error?: string }> {
    const verificationUrl = `${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            font-family: 'Arial', sans-serif; 
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .header { 
            background: white; 
            color: #333; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px 10px 0 0;
            border-bottom: 4px solid #667eea;
          }
          .content { 
            padding: 30px; 
            background: white; 
            line-height: 1.6;
            border-radius: 0 0 10px 10px;
          }
          .button { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 14px 28px; 
            text-decoration: none; 
            border-radius: 6px; 
            display: inline-block;
            font-weight: bold;
            margin: 20px 0;
            border: none;
            cursor: pointer;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #6b7280;
            font-size: 14px;
            background: #f8f9fa;
            border-radius: 0 0 10px 10px;
            margin-top: 20px;
          }
          .verification-code {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            word-break: break-all;
            font-family: monospace;
            border-left: 4px solid #667eea;
          }
          .icon {
            font-size: 48px;
            margin-bottom: 20px;
          }
          .features {
            display: flex;
            justify-content: space-between;
            margin: 25px 0;
            text-align: center;
          }
          .feature {
            flex: 1;
            padding: 15px;
            background: #f8f9fa;
            margin: 0 5px;
            border-radius: 8px;
            border-top: 3px solid #667eea;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">✅</div>
            <h1>Daily Task To-Do Planner</h1>
            <h2>Verify Your Email Address</h2>
          </div>
          <div class="content">
            <h3>Hello ${name},</h3>
            <p>Welcome to <strong>Daily Task To-Do Planner</strong>! We're excited to help you organize your life and boost your productivity.</p>
            
            <p>To get started and unlock all features, please verify your email address by clicking the button below:</p>
            
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </p>
            
            <p><strong>Or copy and paste this link in your browser:</strong></p>
            <div class="verification-code">
              ${verificationUrl}
            </div>
            
            <div class="features">
              <div class="feature">
                <strong>📝 Task Management</strong>
                <p>Create & organize tasks</p>
              </div>
              <div class="feature">
                <strong>⏰ Smart Reminders</strong>
                <p>Never miss deadlines</p>
              </div>
              <div class="feature">
                <strong>📊 Progress Tracking</strong>
                <p>Monitor your productivity</p>
              </div>
            </div>
            
            <p><strong>Important:</strong> This verification link will expire in <strong>24 hours</strong>.</p>
            
            <p>If you didn't create an account with us, please ignore this email.</p>
            
            <p>Ready to conquer your day? Let's get organized! 🚀</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Daily Task To-Do Planner. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `Welcome to Daily Task To-Do Planner!\n\nHello ${name},\n\nPlease verify your email by clicking the following link:\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.\n\nGet ready to organize your tasks and boost your productivity!`;

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email - Daily Task To-Do Planner',
      html,
      text
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<{ success: boolean; error?: string }> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .header { 
            background: white; 
            color: #333; 
            padding: 40px; 
            text-align: center; 
            border-radius: 10px 10px 0 0;
            border-bottom: 4px solid #667eea;
          }
          .content { 
            padding: 40px; 
            background: white;
            line-height: 1.6;
            border-radius: 0 0 10px 10px;
          }
          .feature {
            background: #f8f9fa;
            padding: 20px;
            margin: 15px 0;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            display: flex;
            align-items: center;
          }
          .feature-icon {
            font-size: 24px;
            margin-right: 15px;
            background: #667eea;
            color: white;
            padding: 10px;
            border-radius: 50%;
            width: 45px;
            height: 45px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .cta {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 8px;
            text-align: center;
            margin: 25px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
            <h1>Welcome to Daily Task To-Do Planner!</h1>
            <p>Your email has been successfully verified</p>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Congratulations! Your email has been successfully verified and your account is now fully activated. 🎯</p>
            
            <p><strong>You now have access to all features:</strong></p>
            
            <div class="feature">
              <div class="feature-icon">✓</div>
              <div>
                <strong>Smart Task Management</strong><br>
                Create, organize, and prioritize your daily tasks
              </div>
            </div>
            
            <div class="feature">
              <div class="feature-icon">⏰</div>
              <div>
                <strong>Intelligent Reminders</strong><br>
                Set reminders and never miss important deadlines
              </div>
            </div>
            
            <div class="feature">
              <div class="feature-icon">📊</div>
              <div>
                <strong>Progress Analytics</strong><br>
                Track your productivity with detailed insights
              </div>
            </div>
            
            <div class="feature">
              <div class="feature-icon">🏷️</div>
              <div>
                <strong>Categories & Labels</strong><br>
                Organize tasks with custom categories and tags
              </div>
            </div>
            
            <div class="cta">
              <h3>Ready to Get Started?</h3>
              <p>Begin by creating your first task and experience the power of organized productivity!</p>
            </div>
            
            <p><strong>Pro Tip:</strong> Start with 3-5 important tasks for today and build your productive habit gradually.</p>
            
            <p>We're excited to help you achieve more every day! 🌟</p>
            
            <p><strong>Happy organizing!</strong><br>
            The Daily Task To-Do Planner Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to Daily Task To-Do Planner! 🎯',
      html
    });
  }

  async sendTaskSummaryEmail(
    email: string, 
    name: string, 
    summary: {
      totalTasks: number;
      completedTasks: number;
      pendingTasks: number;
      overdueTasks: number;
      completionRate: number;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .header { 
            background: white; 
            color: #333; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px 10px 0 0;
          }
          .content { 
            padding: 30px; 
            background: white;
            line-height: 1.6;
            border-radius: 0 0 10px 10px;
          }
          .stats {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin: 25px 0;
          }
          .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-top: 4px solid #667eea;
          }
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
          }
          .progress-bar {
            background: #e9ecef;
            border-radius: 10px;
            height: 10px;
            margin: 15px 0;
            overflow: hidden;
          }
          .progress-fill {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            height: 100%;
            border-radius: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Your Daily Task Summary</h1>
            <p>Here's your productivity update</p>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Here's a summary of your task progress:</p>
            
            <div class="stats">
              <div class="stat-card">
                <div class="stat-number">${summary.totalTasks}</div>
                <div>Total Tasks</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${summary.completedTasks}</div>
                <div>Completed</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${summary.pendingTasks}</div>
                <div>Pending</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${summary.overdueTasks}</div>
                <div>Overdue</div>
              </div>
            </div>
            
            <div>
              <strong>Completion Rate: ${summary.completionRate}%</strong>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${summary.completionRate}%"></div>
              </div>
            </div>
            
            <p style="margin-top: 25px;">
              <strong>💡 Tip:</strong> ${summary.completionRate >= 80 ? 'Amazing progress! Keep up the great work!' : 
              summary.completionRate >= 50 ? 'Good progress! Try to complete a few more tasks tomorrow.' : 
              'Every task completed is a step forward. Keep going!'}
            </p>
            
            <p>Ready to plan for tomorrow? Open the app and stay productive! 🚀</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `📊 Your Daily Task Summary - ${summary.completionRate}% Complete`,
      html
    });
  }

}

export default new EmailService();