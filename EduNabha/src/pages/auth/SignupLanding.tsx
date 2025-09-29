import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import SocialAuth from '../../components/SocialAuth'
import { googleSignIn, setToken } from '../../api/client'
import { useState } from 'react'

export default function SignupLanding() {
	const navigate = useNavigate()
	const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | 'parent' | null>(null)
	const [isGoogleLoading, setIsGoogleLoading] = useState(false)

	async function handleGoogleAuth(credential: string) {
		if (!selectedRole) {
			alert('Please select a role first')
			return
		}
		try {
			setIsGoogleLoading(true)
			const result = await googleSignIn(credential, selectedRole)
			setToken(result.token)
			navigate(`/${selectedRole}`)
		} catch (error) {
			console.error('Google authentication failed:', error)
			alert('Authentication failed. Please try again.')
		} finally {
			setIsGoogleLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-gray-50 flex items-start justify-center p-6">
			<div className="w-full max-w-3xl">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-semibold text-gray-900">Join Our Community</h1>
					<p className="text-gray-500 mt-2">Digital Learning Platform for Rural Students</p>
					<p className="text-sm text-gray-500 mt-2">Sign up using your Google account or create a new account with email.</p>
					{selectedRole && (
						<div className="mt-6 max-w-sm mx-auto">
							<p className="text-sm font-medium text-indigo-600 mb-3">Signing up as {selectedRole}</p>
							<SocialAuth 
								label={isGoogleLoading ? 'Signing up...' : 'Continue with Google'} 
								onToken={handleGoogleAuth}
								disabled={isGoogleLoading}
							/>
							<button 
								onClick={() => setSelectedRole(null)}
								className="mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
							>
								Choose different role
							</button>
						</div>
					)}
				</div>
				<div className="space-y-6">
					<div 
						onClick={() => setSelectedRole('student')}
						className={`block card hover:shadow-md transition cursor-pointer ${
							selectedRole === 'student' ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''
						}`}
					>
						<div className="flex items-center gap-6 p-2">
							<div className="text-3xl">🎓</div>
							<div className="flex-1">
								<h2 className="text-xl font-semibold text-gray-900">Sign Up as Student</h2>
								<p className="text-gray-500">Access courses, track your progress, and learn new skills.</p>
							</div>
							<div className="text-right">
								<Link 
									to="/signup/student" 
									className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
									onClick={(e) => e.stopPropagation()}
								>
									Sign up with Email →
								</Link>
							</div>
						</div>
					</div>

					<div 
						onClick={() => setSelectedRole('teacher')}
						className={`block card hover:shadow-md transition cursor-pointer ${
							selectedRole === 'teacher' ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''
						}`}
					>
						<div className="flex items-center gap-6 p-2">
							<div className="text-3xl">👩‍🏫</div>
							<div className="flex-1">
								<h2 className="text-xl font-semibold text-gray-900">Sign Up as Teacher</h2>
								<p className="text-gray-500">Create courses, manage students, and share your knowledge.</p>
							</div>
							<div className="text-right">
								<Link 
									to="/signup/teacher" 
									className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
									onClick={(e) => e.stopPropagation()}
								>
									Sign up with Email →
								</Link>
							</div>
						</div>
					</div>

					<div 
						onClick={() => setSelectedRole('parent')}
						className={`block card hover:shadow-md transition cursor-pointer ${
							selectedRole === 'parent' ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''
						}`}
					>
						<div className="flex items-center gap-6 p-2">
							<div className="text-3xl">👪</div>
							<div className="flex-1">
								<h2 className="text-xl font-semibold text-gray-900">Sign Up as Parent</h2>
								<p className="text-gray-500">Track your child's performance and stay connected with teachers.</p>
							</div>
							<div className="text-right">
								<Link 
									to="/signup/parent" 
									className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
									onClick={(e) => e.stopPropagation()}
								>
									Sign up with Email →
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
