// src/app/api/course/route.js

import { getClientPromise } from "@/lib/mongodb";
import { successResponse, errorResponse } from "@/lib/utils";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import corsHeaders from "@/lib/cors";

function getUser(request) {
  try {
    let token = request.cookies.get("token")?.value;

    if (!token) {
      const authHeader = request.headers.get("authorization");

      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) return null;

    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// GET courses
export async function GET(request) {
    try {
        const user = getUser(request);

        if (!user) {
            return errorResponse("Unauthorized", 401);
        }

        const client = await getClientPromise();
        const db = client.db();

        // Teacher can only see own courses
        if (user.role === "Teacher") {
            const courses = await db
                .collection("courses")
                .find({ teacherId: user.id })
                .toArray();

            return successResponse(courses, 200);
        }

        // Student can see all courses except Cancel
        if (user.role === "Student") {
            const { searchParams } = new URL(request.url);
            const search = searchParams.get("search")?.trim();

            const filter = {
                status: { $ne: "Cancel" },
            };

            if (search) {
                const escapedSearch = search.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&",
                );

                filter.$or = [
                    {
                        courseName: {
                            $regex: escapedSearch,
                            $options: "i",
                        },
                    },
                    {
                        teacherName: {
                            $regex: escapedSearch,
                            $options: "i",
                        },
                    },
                ];
            }

            const courses = await db
                .collection("courses")
                .find(filter)
                .toArray();

            return successResponse(courses, 200);
        }

        return errorResponse("Invalid role", 403);
    } catch (error) {
        console.error(error);
        return errorResponse("Failed to get courses", 500);
    }
}

// POST create course
export async function POST(request) {
    try {
        const user = getUser(request);

        if (!user) {
            return errorResponse("Unauthorized", 401);
        }

        if (user.role !== "Teacher") {
            return errorResponse("Only Teachers can create courses", 403);
        }

        const body = await request.json();

        const {
            courseName,
            duration,
            topics,
            price,
            maxStudent,
            status,
        } = body;

        if (
            !courseName ||
            !duration ||
            !Array.isArray(topics) ||
            topics.length === 0 ||
            price === undefined ||
            !maxStudent ||
            !status
        ) {
            return errorResponse("All course fields are required", 400);
        }

        if (!["Open", "Close", "Cancel"].includes(status)) {
            return errorResponse("Invalid course status", 400);
        }

        if (
            Number(duration) <= 0 ||
            Number(price) < 0 ||
            Number(maxStudent) <= 0
        ) {
            return errorResponse("Invalid course values", 400);
        }

        const client = await getClientPromise();
        const db = client.db();

        const course = {
            courseName,
            duration: Number(duration),
            topics,
            price: Number(price),
            maxStudent: Number(maxStudent),
            status,

            teacherId: user.id,
            teacherName: user.username,

            enrolledStudents: [],

            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection("courses").insertOne(course);

        return successResponse(
            {
                message: "Course created successfully",
                courseId: result.insertedId,
            },
            201,
        );
    } catch (error) {
        console.error(error);
        return errorResponse("Failed to create course", 500);
    }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}