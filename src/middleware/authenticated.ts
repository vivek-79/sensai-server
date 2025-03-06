


import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { variables } from '../constants';

export const authenticateUser = (req: Request, res: Response, next: NextFunction):void => {
    const token = req.cookies.accessToken;
    if (!token) {
        res.status(401).json({ message: 'Unauthorized', success: false });
        return;
    }

    try {
        const decoded = jwt.verify(token, variables.secrets.accessTokenSecret);
        (req as any).userId = decoded; // Attach user data to request
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token', success: false });
        return;
    }
};