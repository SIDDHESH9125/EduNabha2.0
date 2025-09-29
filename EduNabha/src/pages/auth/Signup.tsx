import { FormEvent, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { signup, setToken, googleSignIn } from '../../api/client'
import SocialAuth from '../../components/SocialAuth'

export function Signup() {
	const navigate = useNavigate()
	const location = useLocation()
	const initialRole = useMemo(() => new URLSearchParams(location.search).get('role') ?? 'student', [location.search])
	const [role, setRole] = useState<'student' | 'teacher' | 'parent'>(initialRole as any)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	async function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setError('')
		setLoading(true)
		try {
			const form = new FormData(e.currentTarget)
			const name = String(form.get('name') || '')
			const email = String(form.get('email') || '')
			const password = String(form.get('password') || '')
			
			if (!name || !email || !password) {
				setError('Please fill in all fields')
				return
			}
			
			const res = await signup({ 
				role, 
				email, 
				password, 
				profile: { name } 
			})
			setToken(res.token)
			if (role === 'teacher') navigate('/teacher')
			else if (role === 'parent') navigate('/parent')
			else navigate('/student')
		} catch (err: any) {
			console.error('Signup failed:', err)
			setError(err.message || 'Signup failed. Please try again.')
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
			console.error('Google sign-up failed:', err)
			setError(err.message || 'Google sign-up failed. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-6">
					<h1 className="text-3xl font-semibold text-gray-900">Create Account</h1>
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
								{r.charAt(0).toUpperCase() + r.slice(1)}
							</button>
						))}
					</div>
					
					<form className="space-y-3" onSubmit={onSubmit}>
						<input name="name" placeholder="Full name" className="border border-gray-300 rounded-md px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500" required />
						<input name="email" type="email" placeholder="Email" className="border border-gray-300 rounded-md px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500" required />
						<input name="password" type="password" placeholder="Password (min. 6 characters)" className="border border-gray-300 rounded-md px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500" minLength={6} required />
						{error && <p className="text-sm text-rose-600">{error}</p>}
						<button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-md py-3 transition">{loading ? 'Creating account...' : 'Create account'}</button>
					</form>
					
					<div className="relative my-6">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-300" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-white px-2 text-gray-500">Or continue with</span>
						</div>
					</div>
					
					<SocialAuth onToken={onGoogle} disabled={loading} label={loading ? 'Signing up...' : 'Sign up with Google'} />
				</div>
				<div className="text-center text-sm text-gray-600 mt-6">
					Already have an account?{' '}
					<a className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors" href="/login">
						Sign in
					</a>
				</div>
			</div>
		</div>
	)
}
