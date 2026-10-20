import { HashRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherCourse from "./pages/TeacherCourse";
import StudentDashboard from "./pages/StudentDashboard";
import StudentCourse from "./pages/StudentCourse";

function StudentPage() {
  return (
    <div style={{ padding: "30px" }}>
      <h1>Student Dashboard</h1>
      <p>Student login successful.</p>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/course/:courseId" element={<TeacherCourse />}/>

        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/course/:courseId" element={<StudentCourse />}/>
        
      </Routes>
    </HashRouter>
  );
}