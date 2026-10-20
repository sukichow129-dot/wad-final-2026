import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function StudentDashboard() {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  // Get JWT token
  function getAuthHeaders() {
    const token = localStorage.getItem("token");

    if (token) {
      return {
        Authorization: `Bearer ${token}`,
      };
    }

    return {};
  }

  async function loadCourses(searchText = "") {
    try {
      const url = searchText
        ? `${API_URL}/api/course?search=${encodeURIComponent(searchText)}`
        : `${API_URL}/api/course`;

      const response = await fetch(url, {
        credentials: "include",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to load courses");
        return;
      }

      setCourses(data);
      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to server");
    }
  }

  async function loadEnrolledCourses() {
    try {
      const response = await fetch(
        `${API_URL}/api/course/enrolled`,
        {
          credentials: "include",
          headers: getAuthHeaders(),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setEnrolledCourses(data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadCourses();
    loadEnrolledCourses();
  }, []);

  function handleSearch(event) {
    event.preventDefault();
    loadCourses(search);
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
          <h1>Student Dashboard</h1>
          <p>
            Welcome, <strong>{user?.username}</strong>
          </p>
        </div>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>

      <hr />

      <h2>Available Courses</h2>

      <form onSubmit={handleSearch}>
        <input
          placeholder="Search course or teacher"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <button type="submit">
          Search
        </button>

        <button
          type="button"
          onClick={() => {
            setSearch("");
            loadCourses("");
          }}
        >
          Clear
        </button>
      </form>

      {message && <p>{message}</p>}

      <br />

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
              <th>Teacher</th>
              <th>Duration</th>
              <th>Price</th>
              <th>Seats</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {courses.map((course) => (
              <tr key={course._id}>
                <td>{course.courseName}</td>
                <td>{course.teacherName}</td>
                <td>{course.duration}</td>
                <td>{course.price}</td>

                <td>
                  {course.enrolledStudents?.length || 0}
                  /
                  {course.maxStudent}
                </td>

                <td>{course.status}</td>

                <td>
                  <button
                    onClick={() =>
                      navigate(`/student/course/${course._id}`)
                    }
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <hr />

      <h2>My Enrolled Courses</h2>

      {enrolledCourses.length === 0 ? (
        <p>You have not enrolled in any courses.</p>
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
              <th>Teacher</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {enrolledCourses.map((course) => (
              <tr key={course._id}>
                <td>{course.courseName}</td>
                <td>{course.teacherName}</td>
                <td>{course.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}