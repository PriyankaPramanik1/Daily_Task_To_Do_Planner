import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
    userId?: string;
    email: string;
    role: string;
    name?: string;
}

declare module "express-serve-static-core" {
    interface Request {
       user?: JwtPayload;
    }
}

// export interface AuthRequest extends Request {
//   user?: JwtPayload;
// }

export const protect = (req: Request, res: Response, next: NextFunction) => {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
        return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

        req.user = decoded;

        next();
        
    } catch (err) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};