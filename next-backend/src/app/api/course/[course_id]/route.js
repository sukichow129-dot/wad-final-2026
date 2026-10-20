import { getClientPromise } from "@/lib/mongodb";
import { successResponse, errorResponse } from "@/lib/utils";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import corsHeaders from "@/lib/cors";

function getUser(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return null;
    }

    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// GET course details
export async function GET(request, { params }) {
  try {
    const user = getUser(request);

    if (!user) {
      return errorResponse("Unauthorized", 401);
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

    // Teacher can only view own course
    if (user.role === "Teacher" && course.teacherId !== user.id) {
      return errorResponse("Forbidden", 403);
    }

    // Student cannot view cancelled course
    if (user.role === "Student" && course.status === "Cancel") {
      return errorResponse("Course not found", 404);
    }

    return successResponse(course, 200);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to get course", 500);
  }
}

// UPDATE course
export async function PUT(request, { params }) {
  try {
    const user = getUser(request);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    if (user.role !== "Teacher") {
      return errorResponse("Only Teachers can update courses", 403);
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

    if (course.teacherId !== user.id) {
      return errorResponse("You can only update your own course", 403);
    }

    const body = await request.json();

    const updateData = {};

    if (body.courseName !== undefined) {
      updateData.courseName = body.courseName;
    }

    if (body.duration !== undefined) {
      updateData.duration = Number(body.duration);
    }

    if (body.topics !== undefined) {
      updateData.topics = body.topics;
    }

    if (body.price !== undefined) {
      updateData.price = Number(body.price);
    }

    if (body.maxStudent !== undefined) {
      updateData.maxStudent = Number(body.maxStudent);
    }

    if (body.status !== undefined) {
      if (!["Open", "Close", "Cancel"].includes(body.status)) {
        return errorResponse("Invalid course status", 400);
      }

      updateData.status = body.status;
    }

    updateData.updatedAt = new Date();

    await db.collection("courses").updateOne(
      {
        _id: new ObjectId(course_id),
        teacherId: user.id,
      },
      {
        $set: updateData,
      },
    );

    return successResponse(
      {
        message: "Course updated successfully",
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to update course", 500);
  }
}

// DELETE course
export async function DELETE(request, { params }) {
  try {
    const user = getUser(request);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    if (user.role !== "Teacher") {
      return errorResponse("Only Teachers can delete courses", 403);
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

    if (course.teacherId !== user.id) {
      return errorResponse("You can only delete your own course", 403);
    }

    if (
      Array.isArray(course.enrolledStudents) &&
      course.enrolledStudents.length > 0
    ) {
      return errorResponse(
        "Cannot delete a course with enrolled students",
        400,
      );
    }

    await db.collection("courses").deleteOne({
      _id: new ObjectId(course_id),
      teacherId: user.id,
    });

    return successResponse(
      {
        message: "Course deleted successfully",
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to delete course", 500);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}