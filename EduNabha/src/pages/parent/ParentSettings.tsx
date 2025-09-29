import { useNavigate } from 'react-router-dom'

export default function ParentSettings() {
	const navigate = useNavigate()
	return (
		<div className="min-h-screen bg-gray-50 flex items-start justify-center p-6">
			<div className="w-full max-w-2xl space-y-4">
				<h1 className="text-2xl font-semibold">Parent Settings</h1>

				<section className="card space-y-3">
					<h2 className="font-medium">Profile</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<input className="border rounded px-3 py-2" placeholder="First name" />
						<input className="border rounded px-3 py-2" placeholder="Last name" />
						<input className="border rounded px-3 py-2 md:col-span-2" placeholder="Email" type="email" />
						<input className="border rounded px-3 py-2" placeholder="Contact number" />
						<input className="border rounded px-3 py-2" placeholder="Child name" />
					</div>
					<div className="text-right"><button className="btn">Save Profile</button></div>
				</section>

				<section className="card space-y-3">
					<h2 className="font-medium">Change Password</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<input className="border rounded px-3 py-2 md:col-span-2" placeholder="Current password" type="password" />
						<input className="border rounded px-3 py-2" placeholder="New password" type="password" />
						<input className="border rounded px-3 py-2" placeholder="Confirm new password" type="password" />
					</div>
					<div className="text-right"><button className="btn">Update Password</button></div>
				</section>

				<section className="card space-y-3">
					<h2 className="font-medium">Preferences</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
						<select className="border rounded px-3 py-2">
							<option>English</option>
							<option>हिन्दी</option>
							<option>ਪੰਜਾਬੀ</option>
						</select>
						<select className="border rounded px-3 py-2">
							<option>Light theme</option>
							<option>Dark theme</option>
						</select>
					</div>
				</section>

				<section className="card">
					<button className="btn" onClick={() => navigate('/login?role=parent')}>Logout</button>
				</section>
			</div>
		</div>
	)
}
