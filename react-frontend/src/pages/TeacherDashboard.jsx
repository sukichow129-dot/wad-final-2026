import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function TeacherDashboard() {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    courseName: "",
    duration: "",
    topics: "",
    price: "",
    maxStudent: "",
    status: "Open",
  });

  async function loadCourses() {
    try {
      const response = await fetch(`${API_URL}/api/course`, {
        credentials: "include",
      });

      if (!response.ok) {
        setMessage("Failed to load courses");
        return;
      }

      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to server");
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleCreate(event) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/course`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to create course");
        return;
      }

      setMessage("Course created successfully");

      setForm({
        courseName: "",
        duration: "",
        topics: "",
        price: "",
        maxStudent: "",
        status: "Open",
      });

      loadCourses();
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to server");
    }
  }

  async function handleDelete(course) {
    if (course.enrolledStudents?.length > 0) {
      setMessage("Cannot delete a course with enrolled students");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${course.courseName}?`,
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/api/course/${course._id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Delete failed");
        return;
      }

      setMessage("Course deleted successfully");
      loadCourses();
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to server");
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "30px auto",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1>Teacher Dashboard</h1>
          <p>
            Welcome, <strong>{user?.username}</strong>
          </p>
        </div>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>

      <hr />

      <h2>Create Course</h2>

      <form onSubmit={handleCreate}>
        <input
          name="courseName"
          placeholder="Course Name"
          value={form.courseName}
          onChange={handleChange}
          required
        />

        <input
          name="duration"
          type="number"
          placeholder="Duration"
          value={form.duration}
          onChange={handleChange}
          required
        />

        <input
          name="topics"
          placeholder="Topics: React, JavaScript, MongoDB"
          value={form.topics}
          onChange={handleChange}
          required
        />

        <input
          name="price"
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
        />

        <input
          name="maxStudent"
          type="number"
          placeholder="Max Students"
          value={form.maxStudent}
          onChange={handleChange}
          required
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="Open">Open</option>
          <option value="Close">Close</option>
          <option value="Cancel">Cancel</option>
        </select>

        <button type="submit">
          Create Course
        </button>
      </form>

      {message && (
        <p>
          <strong>{message}</strong>
        </p>
      )}

      <hr />

      <h2>My Courses</h2>

      {courses.length === 0 ? (
        <p>No courses found.</p>
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
              <th>Course</th>
              <th>Duration</th>
              <th>Price</th>
              <th>Students</th>
              <th>Max Students</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {courses.map((course) => (
              <tr key={course._id}>
                <td>{course.courseName}</td>

                <td>{course.duration}</td>

                <td>{course.price}</td>

                <td>
                  {course.enrolledStudents?.length || 0}
                </td>

                <td>{course.maxStudent}</td>

                <td>{course.status}</td>

                <td>
                  <button
                    onClick={() =>
                      navigate(`/teacher/course/${course._id}`)
                    }
                  >
                    View / Edit
                  </button>

                  {" "}

                  <button
                    onClick={() => handleDelete(course)}
                    disabled={
                      (course.enrolledStudents?.length || 0) > 0
                    }
                  >
                    / Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}