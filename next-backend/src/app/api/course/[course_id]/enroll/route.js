import { getClientPromise } from "@/lib/mongodb";
import { successResponse, errorResponse } from "@/lib/utils";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

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

// Student enrolls in a course
export async function POST(request, { params }) {
  try {
    const user = getUser(request);

    // Must login
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    // Only Student can enroll
    if (user.role !== "Student") {
      return errorResponse("Only Students can enroll in courses", 403);
    }

    const { course_id } = await params;

    if (!ObjectId.isValid(course_id)) {
      return errorResponse("Invalid course ID", 400);
    }

    const client = await getClientPromise();
    const db = client.db();

    const course = await db.collection("courses").findOne({
      _id: new ObjectId(course_id),
    });

    if (!course) {
      return errorResponse("Course not found", 404);
    }

    // Only Open course can be enrolled
    if (course.status !== "Open") {
      return errorResponse("Course is not open for enrollment", 400);
    }

    const enrolledStudents = Array.isArray(course.enrolledStudents)
      ? course.enrolledStudents
      : [];

    // Prevent duplicate enrollment
    const alreadyEnrolled = enrolledStudents.some(
      (student) => student.id === user.id,
    );

    if (alreadyEnrolled) {
      return errorResponse("You are already enrolled in this course", 400);
    }

    // Check maximum number of students
    if (enrolledStudents.length >= course.maxStudent) {
      return errorResponse("Course is full", 400);
    }

    const student = {
      id: user.id,
      username: user.username,
      email: user.email,
      enrolledAt: new Date(),
    };

    // Final update also checks status, duplicate and capacity
    const result = await db.collection("courses").updateOne(
      {
        _id: new ObjectId(course_id),
        status: "Open",
        "enrolledStudents.id": { $ne: user.id },
        $expr: {
          $lt: [
            { $size: { $ifNull: ["$enrolledStudents", []] } },
            "$maxStudent",
          ],
        },
      },
      {
        $push: {
          enrolledStudents: student,
        },
        $set: {
          updatedAt: new Date(),
        },
      },
    );

    if (result.modifiedCount === 0) {
      return errorResponse(
        "Enrollment failed. Course may be full or unavailable",
        400,
      );
    }

    return successResponse(
      {
        message: "Enrolled successfully",
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to enroll in course", 500);
  }
}