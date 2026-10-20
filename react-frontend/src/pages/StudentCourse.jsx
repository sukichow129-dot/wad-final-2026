import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function StudentCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [message, setMessage] = useState("");

  async function loadCourse() {
    try {
      const response = await fetch(
        `${API_URL}/api/course/${courseId}`,
        {
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to load course");
        return;
      }

      setCourse(data);
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to server");
    }
  }

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  async function handleEnroll() {
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/course/${courseId}/enroll`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await response.json();

      setMessage(data.message);

      if (response.ok) {
        loadCourse();
      }
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to server");
    }
  }

  if (!course) {
    return (
      <div style={{ padding: "30px" }}>
        <button onClick={() => navigate("/student")}>
          ← Back
        </button>

        <p>{message || "Loading..."}</p>
      </div>
    );
  }

  const enrolledCount =
    course.enrolledStudents?.length || 0;

  const isFull =
    enrolledCount >= course.maxStudent;

  const canEnroll =
    course.status === "Open" && !isFull;

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <button onClick={() => navigate("/student")}>
        ← Back to Dashboard
      </button>

      <h1>{course.courseName}</h1>

      <p>
        <strong>Teacher:</strong>{" "}
        {course.teacherName}
      </p>

      <p>
        <strong>Duration:</strong>{" "}
        {course.duration}
      </p>

      <p>
        <strong>Topics:</strong>{" "}
        {course.topics.join(", ")}
      </p>

      <p>
        <strong>Price:</strong>{" "}
        {course.price}
      </p>

      <p>
        <strong>Status:</strong>{" "}
        {course.status}
      </p>

      <p>
        <strong>Students:</strong>{" "}
        {enrolledCount}/{course.maxStudent}
      </p>

      {course.status === "Close" && (
        <p>This course is closed for enrollment.</p>
      )}

      {isFull && (
        <p>This course is full.</p>
      )}

      <button
        onClick={handleEnroll}
        disabled={!canEnroll}
      >
        {isFull ? "Course Full" : "Enroll"}
      </button>

      {message && (
        <p>
          <strong>{message}</strong>
        </p>
      )}
    </div>
  );
}