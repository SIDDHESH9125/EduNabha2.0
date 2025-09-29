import { FormEvent, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup, setToken, googleSignIn } from '../../api/client'
import SocialAuth from '../../components/SocialAuth'

export default function SignupParent() {
	const navigate = useNavigate()
	const [isLoading, setIsLoading] = useState(false)
	const [isGoogleLoading, setIsGoogleLoading] = useState(false)

	async function handleGoogleAuth(credential: string) {
		try {
			setIsGoogleLoading(true)
			const result = await googleSignIn(credential, 'parent')
			setToken(result.token)
			navigate('/parent')
		} catch (error) {
			console.error('Google authentication failed:', error)
			alert('Authentication failed. Please try again.')
		} finally {
			setIsGoogleLoading(false)
		}
	}

	async function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setIsLoading(true)
		try {
			const form = new FormData(e.currentTarget)
			const profile = {
				name: `${form.get('firstName')} ${form.get('lastName')}`.trim(),
				contact: form.get('contact'),
				childName: form.get('childName'),
				childClass: form.get('childClass'),
			}
			const email = String(form.get('email') || '')
			const password = String(form.get('password') || '')
			const res = await signup({ role: 'parent', email, password, profile })
			setToken(res.token)
			navigate('/parent')
		} catch (error) {
			console.error('Signup failed:', error)
			alert('Signup failed. Please try again.')
		} finally {
			setIsLoading(false)
		}
	}
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
			<div className="w-full max-w-xl card">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-semibold">Create Parent Account</h1>
					<Link to="/signup" className="text-indigo-600 hover:text-indigo-700 text-sm transition-colors">
						← Back
					</Link>
				</div>
				
				{/* Google Sign Up Option */}
				<div className="mb-6">
					<SocialAuth 
						label={isGoogleLoading ? 'Signing up...' : 'Sign up with Google'} 
						onToken={handleGoogleAuth}
						disabled={isGoogleLoading || isLoading}
					/>
					<div className="relative my-6">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-300" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-gray-50 px-2 text-gray-500">Or continue with email</span>
						</div>
					</div>
				</div>
				
				<form className="space-y-4" onSubmit={onSubmit}>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<input name="firstName" placeholder="First name" className="border border-gray-300 rounded-md px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" required />
						<input name="lastName" placeholder="Last name" className="border border-gray-300 rounded-md px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" required />
					</div>
					<input name="email" type="email" placeholder="Email" className="border border-gray-300 rounded-md px-3 py-2 w-full focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" required />
					<input name="password" type="password" placeholder="Password (min. 6 characters)" className="border border-gray-300 rounded-md px-3 py-2 w-full focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" minLength={6} required />
					<input name="contact" placeholder="Contact number" className="border border-gray-300 rounded-md px-3 py-2 w-full focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
					<input name="childName" placeholder="Child's name" className="border border-gray-300 rounded-md px-3 py-2 w-full focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
					<input name="childClass" placeholder="Child's class/grade" className="border border-gray-300 rounded-md px-3 py-2 w-full focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />

					<button 
						className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
							isLoading || isGoogleLoading
								? 'bg-gray-300 text-gray-500 cursor-not-allowed'
								: 'bg-indigo-600 text-white hover:bg-indigo-700'
						}`}
						type="submit" 
						disabled={isLoading || isGoogleLoading}
					>
						{isLoading ? 'Creating Account...' : 'Create Parent Account'}
					</button>
					
					<p className="text-center text-sm text-gray-600">
						Already have an account?{' '}
						<Link to="/login?role=parent" className="text-indigo-600 hover:text-indigo-700 font-medium">
							Sign in
						</Link>
					</p>
				</form>
			</div>
		</div>
	)
}
