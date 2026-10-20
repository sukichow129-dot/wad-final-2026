import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function TeacherCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    courseName: "",
    duration: "",
    topics: "",
    price: "",
    maxStudent: "",
    status: "Open",
  });

  // Get JWT token
  function getAuthHeaders(includeContentType = false) {
    const token = localStorage.getItem("token");

    const headers = {};

    if (includeContentType) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  async function loadCourse() {
    try {
      const response = await fetch(
        `${API_URL}/api/course/${courseId}`,
        {
          credentials: "include",
          headers: getAuthHeaders(),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to load course");
        return;
      }

      setCourse(data);

      setForm({
        courseName: data.courseName,
        duration: data.duration,
        topics: data.topics.join(", "),
        price: data.price,
        maxStudent: data.maxStudent,
        status: data.status,
      });
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to server");
    }
  }

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleUpdate(event) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/course/${courseId}`,
        {
          method: "PUT",

          headers: getAuthHeaders(true),

          credentials: "include",

          body: JSON.stringify({
            courseName: form.courseName,
            duration: Number(form.duration),
            topics: form.topics
              .split(",")
              .map((topic) => topic.trim())
              .filter(Boolean),
            price: Number(form.price),
            maxStudent: Number(form.maxStudent),
            status: form.status,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Update failed");
        return;
      }

      setMessage("Course updated successfully");
      loadCourse();
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to server");
    }
  }

  if (!course) {
    return (
      <div style={{ padding: "30px" }}>
        <button onClick={() => navigate("/teacher")}>
          Back
        </button>

        <p>{message || "Loading..."}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "30px auto",
        padding: "20px",
      }}
    >
      <button onClick={() => navigate("/teacher")}>
        ← Back to Dashboard
      </button>

      <h1>Course Details</h1>

      <form onSubmit={handleUpdate}>
        <div>
          <label>Course Name</label>
          <br />

          <input
            name="courseName"
            value={form.courseName}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label>Duration</label>
          <br />

          <input
            name="duration"
            type="number"
            value={form.duration}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label>Topics</label>
          <br />

          <input
            name="topics"
            value={form.topics}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label>Price</label>
          <br />

          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label>Max Students</label>
          <br />

          <input
            name="maxStudent"
            type="number"
            value={form.maxStudent}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label>Status</label>
          <br />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Open">Open</option>
            <option value="Close">Close</option>
            <option value="Cancel">Cancel</option>
          </select>
        </div>

        <br />

        <button type="submit">
          Update Course
        </button>
      </form>

      {message && (
        <p>
          <strong>{message}</strong>
        </p>
      )}

      <hr />

      <h2>Enrolled Students</h2>

      {course.enrolledStudents?.length === 0 ? (
        <p>No students enrolled.</p>
      ) : (
        <table
          border="1"
          cellPadding="10"
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Enrolled At</th>
            </tr>
          </thead>

          <tbody>
            {course.enrolledStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.username}</td>
                <td>{student.email}</td>
                <td>
                  {new Date(student.enrolledAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}