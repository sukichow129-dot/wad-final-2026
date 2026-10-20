import { getClientPromise } from "@/lib/mongodb";
import { successResponse, errorResponse } from "@/lib/utils";
import jwt from "jsonwebtoken";

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

// GET courses enrolled by current student
export async function GET(request) {
  try {
    const user = getUser(request);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    if (user.role !== "Student") {
      return errorResponse(
        "Only Students can view enrolled courses",
        403,
      );
    }

    const client = await getClientPromise();
    const db = client.db();

    const courses = await db
      .collection("courses")
      .find({
        "enrolledStudents.id": user.id,
      })
      .toArray();

    return successResponse(courses, 200);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to get enrolled courses", 500);
  }
}