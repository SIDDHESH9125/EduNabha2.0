import { useEffect, useState } from 'react'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

// Debug logging
console.log('Environment variables:', import.meta.env)
console.log('GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID)

type Props = {
	label?: string
	onToken?: (idToken: string) => void
	disabled?: boolean
}

export default function SocialAuth({ label = 'Continue with Google', onToken, disabled = false }: Props) {
	const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!GOOGLE_CLIENT_ID) {
			setError('Google authentication is not configured')
			return
		}
		
		const id = 'google-identity'
		if (!document.getElementById(id)) {
			const s = document.createElement('script')
			s.src = 'https://accounts.google.com/gsi/client'
			s.async = true
			s.id = id
			s.onload = () => setIsGoogleLoaded(true)
			s.onerror = () => setError('Failed to load Google authentication')
			document.body.appendChild(s)
		} else {
			setIsGoogleLoaded(true)
		}
	}, [])

	function startGoogle() {
		if (!GOOGLE_CLIENT_ID) {
			setError('Google authentication is not configured. Please contact support.')
			return
		}
		
		if (!isGoogleLoaded) {
			setError('Google authentication is still loading. Please try again.')
			return
		}
		
		try {
			// @ts-ignore
			const google = window.google
			if (!google?.accounts?.id) {
				setError('Google authentication service is not available')
				return
			}
			
			google.accounts.id.initialize({
				client_id: GOOGLE_CLIENT_ID,
				callback: (response: any) => {
					if (response.credential) {
						setError(null)
						onToken?.(response.credential)
					} else {
						setError('Authentication failed. Please try again.')
					}
				},
				error_callback: (error: any) => {
					console.error('Google Sign-In Error:', error)
					setError('Authentication failed. Please try again.')
				}
			})
			
				google.accounts.id.prompt((notification: any) => {
					if (notification.isNotDisplayed()) {
						console.log('Google One Tap not displayed:', notification.getNotDisplayedReason())
					}
					if (notification.isSkippedMoment()) {
						console.log('Google One Tap skipped:', notification.getSkippedReason())
					}
				})
		} catch (err) {
			console.error('Error starting Google authentication:', err)
			setError('Authentication failed. Please try again.')
		}
	}

	if (error) {
		return (
			<div className="w-full">
				<button 
					type="button" 
					onClick={startGoogle} 
					disabled={disabled}
					className={`w-full border-2 border-dashed border-red-300 rounded-md px-4 py-3 flex items-center justify-center gap-2 text-red-500 ${
						disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-red-400 hover:bg-red-50 cursor-pointer'
					}`}
				>
					<span>⚠️</span>
					<span className="font-medium text-sm">Google Sign-In Unavailable</span>
				</button>
				<p className="text-xs text-red-600 mt-2 text-center">{error}</p>
			</div>
		)
	}

	return (
		<button 
			type="button" 
			onClick={startGoogle} 
			disabled={disabled || !isGoogleLoaded}
			className={`w-full border border-gray-300 rounded-md px-4 py-3 flex items-center justify-center gap-3 font-medium text-sm transition-all duration-200 ${
				disabled || !isGoogleLoaded
					? 'bg-gray-100 text-gray-400 cursor-not-allowed'
					: 'bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm active:scale-[0.98]'
			}`}
		>
			{!isGoogleLoaded ? (
				<div className="flex items-center gap-2">
					<div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
					<span>Loading...</span>
				</div>
			) : (
				<>
					<svg className="w-5 h-5" viewBox="0 0 24 24">
						<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
						<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
						<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
						<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
					</svg>
					<span>{label}</span>
				</>
			)}
		</button>
	)
}
