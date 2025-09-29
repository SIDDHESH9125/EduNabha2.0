import { useState } from 'react'

type Student = { id: string; name: string; present: boolean }

type Submission = { id: string; student: string; assignment: string; status: 'submitted' | 'graded' }

export function TeacherDashboard() {
	const overview = {
		totalStudents: 120,
		presentToday: 105,
		averageScore: 78,
	}
	const activities = [
		{ id: 'a1', title: 'Assignment Graded', meta: 'Math: Chapter 1 • 25 students', time: 'Just now', color: 'bg-sky-500' },
		{ id: 'a2', title: 'New Student Added', meta: 'Grade 10 • Riya Sharma', time: '1 hour ago', color: 'bg-emerald-500' },
		{ id: 'a3', title: 'Quiz Created', meta: 'Science • Due tomorrow', time: '1 hour ago', color: 'bg-amber-500' },
	]
	return (
		<div className="min-h-screen bg-gray-50">
			<header className="sticky top-0 bg-white/80 backdrop-blur border-b">
				<div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
					<p className="text-sm text-gray-600">Welcome, <span className="font-medium text-gray-800">Teacher</span></p>
					<div className="flex items-center gap-2">
						<a href="/teacher/settings" className="p-2 rounded-md border text-gray-700 hover:bg-gray-50" title="Settings">⚙️</a>
						<button className="p-2 rounded-md border text-gray-600">🔔</button>
						<div className="w-8 h-8 rounded-full bg-indigo-100 grid place-items-center text-indigo-700 font-semibold">T</div>
					</div>
				</div>
			</header>
			<main className="max-w-6xl mx-auto px-4 py-5 space-y-6">
				<section className="bg-white rounded-xl shadow-sm border p-4">
					<div className="flex items-center justify-between">
						<h2 className="text-sm font-semibold text-gray-800">Class Overview</h2>
						<a href="#" className="text-xs text-indigo-600">View All</a>
					</div>
					<div className="mt-4 grid grid-cols-3 gap-3">
						<div className="rounded-lg border p-3"><p className="text-xs text-gray-500">Total Students</p><p className="text-xl font-semibold">{overview.totalStudents}</p></div>
						<div className="rounded-lg border p-3"><p className="text-xs text-gray-500">Present Students</p><p className="text-xl font-semibold text-emerald-600">{overview.presentToday}</p></div>
						<div className="rounded-lg border p-3"><p className="text-xs text-gray-500">Average Score</p><p className="text-xl font-semibold text-indigo-600">{overview.averageScore}%</p></div>
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
