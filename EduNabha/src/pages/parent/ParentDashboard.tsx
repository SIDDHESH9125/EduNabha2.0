export function ParentDashboard() {
	const overview = {
		attendance: 92,
		averageScore: 84,
		assignmentsDue: 1,
	}
	const activities = [
		{ id: 'p1', title: 'Completed Math Quiz', meta: 'Score 85%', time: 'Today', color: 'bg-emerald-500' },
		{ id: 'p2', title: 'Submitted Science Assignment', meta: 'On time', time: 'Yesterday', color: 'bg-sky-500' },
		{ id: 'p3', title: 'Absent', meta: 'One class missed', time: 'This week', color: 'bg-rose-500' },
	]
	return (
		<div className="min-h-screen bg-gray-50">
			<header className="sticky top-0 bg-white/80 backdrop-blur border-b">
				<div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
					<p className="text-sm text-gray-600">Welcome, <span className="font-medium text-gray-800">Parent</span></p>
					<div className="flex items-center gap-2">
						<a href="/parent/settings" className="p-2 rounded-md border text-gray-700 hover:bg-gray-50" title="Settings">⚙️</a>
						<button className="p-2 rounded-md border text-gray-600">🔔</button>
						<div className="w-8 h-8 rounded-full bg-teal-100 grid place-items-center text-teal-700 font-semibold">P</div>
					</div>
				</div>
			</header>
			<main className="max-w-6xl mx-auto px-4 py-5 space-y-6">
				<section className="bg-white rounded-xl shadow-sm border p-4">
					<div className="flex items-center justify-between">
						<h2 className="text-sm font-semibold text-gray-800">Child Overview</h2>
						<a href="#" className="text-xs text-indigo-600">View Details</a>
					</div>
					<div className="mt-4 grid grid-cols-3 gap-3">
						<div className="rounded-lg border p-3"><p className="text-xs text-gray-500">Attendance</p><p className="text-xl font-semibold text-emerald-600">{overview.attendance}%</p></div>
						<div className="rounded-lg border p-3"><p className="text-xs text-gray-500">Average Score</p><p className="text-xl font-semibold text-indigo-600">{overview.averageScore}%</p></div>
						<div className="rounded-lg border p-3"><p className="text-xs text-gray-500">Assignments</p><p className="text-xl font-semibold">{overview.assignmentsDue} due</p></div>
					</div>
				</section>
				<section className="bg-white rounded-xl shadow-sm border">
					<div className="px-4 py-3 border-b flex items-center justify-between">
						<h2 className="text-sm font-semibold text-gray-800">Recent Activity</h2>
						<a href="#" className="text-xs text-indigo-600">View All</a>
					</div>
					<ul className="divide-y">
						{activities.map(a => (
							<li key={a.id} className="px-4 py-3 flex items-start gap-3">
								<div className={`w-8 h-8 rounded-full ${a.color} text-white grid place-items-center`}>•</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
									<p className="text-xs text-gray-500 truncate">{a.meta}</p>
								</div>
								<div className="text-xs text-gray-400 whitespace-nowrap">{a.time}</div>
							</li>
						))}
					</ul>
				</section>
			</main>
		</div>
	)
}
