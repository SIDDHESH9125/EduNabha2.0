import { FormEvent, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { login, setToken, googleSignIn } from '../../api/client'
import SocialAuth from '../../components/SocialAuth'

const roleLabels: Record<string, string> = {
	student: 'Student',
	teacher: 'Teacher',
	parent: 'Parent',
}

export function Login() {
	const navigate = useNavigate()
	const location = useLocation()
	const initialRole = useMemo(() => new URLSearchParams(location.search).get('role') ?? 'student', [location.search])
	const [role, setRole] = useState<'student' | 'teacher' | 'parent'>(initialRole as any)
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	async function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setError('')
		setLoading(true)
		try {
			const form = new FormData(e.currentTarget)
			const email = String(form.get('email') || '')
			const password = String(form.get('password') || '')
			const res = await login({ email, password })
			setToken(res.token)
			if (role === 'teacher') navigate('/teacher')
			else if (role === 'parent') navigate('/parent')
			else navigate('/student')
		} catch (err: any) {
			console.error('Login failed:', err)
			setError(err.message || 'Invalid credentials. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	async function onGoogle(idToken: string) {
		setError('')
		setLoading(true)
		try {
			const res = await googleSignIn(idToken, role)
			setToken(res.token)
			navigate(`/${role}`)
		} catch (err: any) {
			console.error('Google sign-in failed:', err)
			setError(err.message || 'Google sign-in failed. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-6">
					<h1 className="text-3xl font-semibold text-gray-900">Welcome Back</h1>
					<p className="text-gray-500 mt-2">Digital Learning Platform for Nabha</p>
				</div>
				<div className="card">
					<div className="grid grid-cols-3 gap-2 mb-4">
						{(['student','teacher','parent'] as const).map(r => (
							<button
								key={r}
								type="button"
								onClick={() => setRole(r)}
								className={`px-4 py-3 rounded-md border text-sm font-medium transition ${role===r ? 'border-indigo-500 ring-2 ring-indigo-200 text-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
							>
								{roleLabels[r]}
							</button>
						))}
					</div>
					<form className="space-y-3" onSubmit={onSubmit}>
						<input name="email" type="email" placeholder="Email" className="border border-gray-300 rounded-md px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500" />
						<input name="password" type="password" placeholder="Password" className="border border-gray-300 rounded-md px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500" />
						{error && <p className="text-sm text-rose-600">{error}</p>}
						<div className="text-right text-sm">
							<a className="text-indigo-600 hover:text-indigo-700" href="#">Forgot password?</a>
						</div>
						<button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-md py-3 transition">{loading ? 'Logging in...' : 'Login'}</button>
					</form>
					<div className="relative my-6">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-300" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-white px-2 text-gray-500">Or continue with</span>
						</div>
					</div>
					<SocialAuth onToken={onGoogle} disabled={loading} label={loading ? 'Signing in...' : 'Sign in with Google'} />
				</div>
				<div className="text-center text-sm text-gray-600 mt-6">
					Don't have an account?{' '}
					<a className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors" href="/signup">
						Sign up
					</a>
				</div>
			</div>
		</div>
	)
}
