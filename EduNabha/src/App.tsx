import { Route, Routes, Navigate, Outlet } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { Login } from './pages/auth/Login'
import { Signup } from './pages/auth/Signup'
import SignupLanding from './pages/auth/SignupLanding'
import SignupStudent from './pages/auth/SignupStudent'
import SignupTeacher from './pages/auth/SignupTeacher'
import SignupParent from './pages/auth/SignupParent'
import { StudentDashboard } from './pages/student/StudentDashboard'
import StudentSettings from './pages/student/StudentSettings'
import OfflineVideos from './pages/student/OfflineVideos'
import StudyDashboard from './pages/student/StudyDashboard'
import { TeacherDashboard } from './pages/teacher/TeacherDashboard'
import TeacherSettings from './pages/teacher/TeacherSettings'
import { ParentDashboard } from './pages/parent/ParentDashboard'
import ParentSettings from './pages/parent/ParentSettings'
import Quiz from './pages/games/Quiz'
import WordMatch from './pages/games/WordMatch'
import { getToken } from './api/client'

function RequireAuth() {
	const token = getToken()
	return token ? <Outlet /> : <Navigate to="/login?role=student" replace />
}

export default function App() {
	return (
		<div className="min-h-screen text-gray-900">
			<Routes>
				<Route path="/" element={<Landing />} />
				<Route path="/login" element={<Login />} />
				<Route path="/signup-simple" element={<Signup />} />
				<Route path="/signup" element={<SignupLanding />} />
				<Route path="/signup/student" element={<SignupStudent />} />
				<Route path="/signup/teacher" element={<SignupTeacher />} />
				<Route path="/signup/parent" element={<SignupParent />} />

				<Route element={<RequireAuth />}> 
					<Route path="/student" element={<StudentDashboard />} />
					<Route path="/student/settings" element={<StudentSettings />} />
					<Route path="/student/offline-videos" element={<OfflineVideos />} />
					<Route path="/student/study-dashboard" element={<StudyDashboard />} />
					<Route path="/teacher" element={<TeacherDashboard />} />
					<Route path="/teacher/settings" element={<TeacherSettings />} />
					<Route path="/parent" element={<ParentDashboard />} />
					<Route path="/parent/settings" element={<ParentSettings />} />
					<Route path="/games/quiz" element={<Quiz />} />
					<Route path="/games/match" element={<WordMatch />} />
				</Route>

				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</div>
	)
}
