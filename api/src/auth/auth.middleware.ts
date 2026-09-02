import type { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { env } from "../config/env.js";
import type { JwtData, TSignIn } from "./auth.types.js";
import { validateUser } from "./auth.service.js";

export function authJwtheader(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const authorization = req.headers.authorization;

    if (!authorization) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET);

        res.locals.user = payload as JwtData;
        next();
    } catch {
        res.status(401).json({ message: "Invalid or expired token" });
    }
}

export async function authLocal(
	req: Request,
    res: Response,
    next: NextFunction
	): Promise<void> {
	try {
		const linkData = res.locals.validatedData as TSignIn;

		if (!linkData) {
			res.status(401).json({ message: "Unauthorized" });
			return
		}

		const user = await validateUser(linkData);
		if (!user) {
			res.status(401).json({ message: "Unauthorized" });
		}
        res.locals.user = user;
		next();
	} catch (err) {
		return next(err);
	}
}