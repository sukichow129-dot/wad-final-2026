# How to Test the App

## Student Information

- **Student Name: Kaiming Zhou
- **Student ID: 6632052

## Test Credentials

### Teacher Accounts

- **Username / Email:** teacher1@test.com
- **Password:** 123456

- **Username / Email:** teacher2@test.com
- **Password:** 123456

- **Username / Email:** teacher3@test.com
- **Password:** 123456

### Student Accounts

- **Username / Email:** student1@test.com
- **Password:** 123456

- **Username / Email:** student2@test.com
- **Password:** 123456

- **Username / Email:** student3@test.com
- **Password:** 123456

## Prerequisites

- Node.js and npm
- MongoDB Atlas
- Internet connection
- Backend `.env.local` file with `MONGODB_URI` and `JWT_SECRET`
- Frontend `.env` file with `VITE_API_URL`

## How to Run & Test

### 1. Backend Setup (`next-backend/`)

Open a terminal and run:

cd next-backend
npm install
npm run dev


Create a `.env.local` file inside `next-backend/`:


MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_JWT_SECRET


The backend runs on:
http://localhost:3000


### 2. Frontend Setup (`react-frontend/`)

Open another terminal and run:

cd react-frontend
npm install
npm run dev


Create a `.env` file inside `react-frontend/`:

VITE_API_URL=http://localhost:3000

The frontend runs on:
http://localhost:5173

## Project Links

- **GitHub Repository:** https://github.com/sukichow129-dot/wad-final-2026
- **Frontend:** https://wad-final-2026-forntend.vercel.app
- **Backend:** https://wad-final-2026-backend.vercel.app


### 3. Testing Walkthrough

#### Teacher

1. Login using `teacher1@test.com` and password `123456`.
2. View the teacher's own courses.
3. Create a new course.
4. View course details.
5. Update course information and course status.
6. View students enrolled in the course.
7. Delete a course if no students are enrolled.
8. A course with enrolled students cannot be deleted.
9. Logout.

#### Student

1. Login using `student1@test.com` and password `123456`.
2. View available courses.
3. Search by partial course name or teacher name.
4. View course details.
5. Enroll in an Open course if seats are available.
6. View enrolled courses in "My Enrolled Courses".
7. A student cannot enroll in the same course twice.
8. A student cannot enroll in a Close course.
9. A student cannot enroll in a full course.
10. Cancelled courses are hidden from students.
11. Logout.

## Course Rules

- **Open:** Students can view and enroll if seats are available.
- **Close:** Students can view the course but cannot enroll.
- **Cancel:** The course is hidden from students and enrollment is not allowed.
- Students cannot enroll in the same course more than once.
- Teachers can only view and manage their own courses.
- Teachers cannot delete a course when students are enrolled.