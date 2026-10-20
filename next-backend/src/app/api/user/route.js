// src/app/api/user/route.js

import { getClientPromise } from "@/lib/mongodb";
import { successResponse, errorResponse } from "@/lib/utils";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import corsHeaders from "@/lib/cors";

// Create user
export async function POST(request) {
    try {
        const body = await request.json();

        const { username, email, password, role } = body;

        if (!username || !email || !password || !role) {
            return errorResponse("All fields are required", 400);
        }

        if (role !== "Student" && role !== "Teacher") {
            return errorResponse("Role must be Student or Teacher", 400);
        }

        const client = await getClientPromise();
        const db = client.db();

        const existingUser = await db.collection("users").findOne({
            $or: [{ username }, { email }],
        });

        if (existingUser) {
            return errorResponse("User already exists", 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.collection("users").insertOne({
            username,
            email,
            password: hashedPassword,
            role,
            createdAt: new Date(),
        });

        return successResponse(
            {
                message: "User created successfully",
                userId: result.insertedId,
            },
            201,
        );
    } catch (error) {
        console.error(error);
        return errorResponse("Failed to create user", 500);
    }
}

// Login
export async function PUT(request) {
    try {
        const body = await request.json();

        const { email, password } = body;

        if (!email || !password) {
            return errorResponse(
                "Email and password are required",
                400,
            );
        }

        const client = await getClientPromise();
        const db = client.db();

        const user = await db.collection("users").findOne({
            email,
        });

        if (!user) {
            return errorResponse(
                "Invalid email or password",
                401,
            );
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password,
        );

        if (!passwordMatch) {
            return errorResponse(
                "Invalid email or password",
                401,
            );
        }

        // Create JWT token
        const token = jwt.sign(
            {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            },
        );

        // IMPORTANT:
        // Return token to frontend so it can be stored in localStorage
        const response = successResponse(
            {
                message: "Login successful",
                token,
                user: {
                    id: user._id.toString(),
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
            },
            200,
        );

        // Keep cookie authentication too
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
            path: "/",
            maxAge: 60 * 60 * 24,
        });

        return response;
    } catch (error) {
        console.error(error);
        return errorResponse("Login failed", 500);
    }
}

// Get current logged-in user
export async function GET(request) {
    try {
        // First try Cookie
        let token = request.cookies.get("token")?.value;

        // If Cookie is unavailable, try Authorization Bearer token
        if (!token) {
            const authHeader =
                request.headers.get("authorization");

            if (authHeader?.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return errorResponse("Unauthorized", 401);
        }

        const user = jwt.verify(
            token,
            process.env.JWT_SECRET,
        );

        return successResponse(
            {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
            },
            200,
        );
    } catch (error) {
        return errorResponse("Unauthorized", 401);
    }
}

// Logout
export async function DELETE() {
    try {
        const response = successResponse(
            {
                message: "Logout successful",
            },
            200,
        );

        response.cookies.set("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
            path: "/",
            maxAge: 0,
        });

        return response;
    } catch (error) {
        return errorResponse("Logout failed", 500);
    }
}

// CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}