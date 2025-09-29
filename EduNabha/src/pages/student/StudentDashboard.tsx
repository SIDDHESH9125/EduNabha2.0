import { Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { askAI as callAI, getCourses, downloadVideo, getDownloads } from '../../api/client'

export function StudentDashboard() {
	const courses = [
		{ 
			id: 'c1', 
			title: 'Algebra Fundamentals', 
			grade: 'Grade 10', 
			thumb: '📘',
			duration: '45 min',
			lessons: 12,
			videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
			description: 'Master the basics of algebra with step-by-step explanations'
		},
		{ 
			id: 'c2', 
			title: 'Biology: Cell Structure', 
			grade: 'Grade 10', 
			thumb: '🧪',
			duration: '35 min',
			lessons: 8,
			videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8',
			description: 'Explore the fascinating world of cells and their components'
		},
		{ 
			id: 'c3', 
			title: 'Physics: Motion & Forces', 
			grade: 'Grade 10', 
			thumb: '⚡',
			duration: '50 min',
			lessons: 15,
			videoUrl: 'https://www.youtube.com/embed/b240PGCMwV0',
			description: 'Understanding the principles of motion and forces in physics'
		},
		{ 
			id: 'c4', 
			title: 'English Literature', 
			grade: 'Grade 10', 
			thumb: '📖',
			duration: '40 min',
			lessons: 10,
			videoUrl: 'https://www.youtube.com/embed/oHg5SJYRHA0',
			description: 'Dive into classic literature and improve your analysis skills'
		}
	]

	const [downloads, setDownloads] = useState([
		{ 
			id: 'd1', 
			title: 'Algebra Fundamentals - Complete Course', 
			meta: 'MP4 • 125.3 MB', 
			done: true,
			type: 'video',
			url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
			progress: 100
		},
		{ 
			id: 'd2', 
			title: 'Biology Lab Experiments Collection', 
			meta: 'MP4 • 89.7 MB', 
			done: true,
			type: 'video',
			url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
			progress: 100
		},
		{ 
			id: 'd3', 
			title: 'Physics Motion Demonstrations', 
			meta: 'MP4 • 156.8 MB', 
			done: false,
			type: 'video',
			url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
			progress: 0
		},
		{ 
			id: 'd4', 
			title: 'English Literature Study Guide', 
			meta: 'PDF • 4.2 MB', 
			done: true,
			type: 'pdf',
			url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
			progress: 100
		},
		{ 
			id: 'd5', 
			title: 'Chemistry Periodic Table Interactive', 
			meta: 'HTML • 2.1 MB', 
			done: false,
			type: 'interactive',
			url: '#',
			progress: 0
		}
	])

	const [chat, setChat] = useState<{ role: 'user' | 'assistant'; text: string }[]>([])
	const [prompt, setPrompt] = useState('')
	const [imageBase64, setImageBase64] = useState<string | undefined>(undefined)
	const [busy, setBusy] = useState(false)
	const [showChatBot, setShowChatBot] = useState(false)
	const [selectedCourse, setSelectedCourse] = useState<any>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	function handleDownload(download: any) {
		if (download.done) {
			// Create a temporary anchor element to trigger download
			const link = document.createElement('a')
			link.href = download.url
			link.download = download.title
			link.target = '_blank'
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
		} else {
			// Simulate download process
			const updatedDownloads = downloads.map(d => {
				if (d.id === download.id) {
					return { ...d, progress: 0 }
				}
				return d
			})
			setDownloads(updatedDownloads)
			
			// Simulate download progress
			const interval = setInterval(() => {
				setDownloads(prev => prev.map(d => {
					if (d.id === download.id && d.progress < 100) {
						const newProgress = Math.min(d.progress + Math.random() * 15, 100)
						if (newProgress >= 100) {
							clearInterval(interval)
							return { ...d, progress: 100, done: true }
						}
						return { ...d, progress: newProgress }
					}
					return d
				}))
			}, 500)
		}
	}

	function toBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const r = new FileReader()
			r.onload = () => resolve(String(r.result).split(',')[1] || '')
			r.onerror = reject
			r.readAsDataURL(file)
		})
	}

	async function askAI() {
		if (!prompt.trim() && !imageBase64) return
		
		const currentPrompt = prompt
		const currentImage = imageBase64
		
		// Clear input immediately for better UX
		setPrompt('')
		setImageBase64(undefined)
		setBusy(true)
		
	setChat(prev => [...prev, { role: 'user', text: currentPrompt || '[Image question]' }])
	
	try {
		const data = await callAI({ prompt: currentPrompt, imageBase64: currentImage })
		setChat(prev => [...prev, { role: 'assistant', text: data.answer || 'Sorry, I couldn\'t process your request. Please try again.' }])
	} catch (error) {
		console.error('Error asking AI:', error)
		setChat(prev => [...prev, { role: 'assistant', text: 'Sorry, there was an error processing your request. Please check your connection and try again.' }])
	} finally {
		setBusy(false)
	}
}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Top Navbar */}
			<nav className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
				<div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
					<h1 className="font-semibold">Dashboard</h1>
					<div className="flex items-center gap-2">
						<Link to="/student/offline-videos" className="p-2 rounded-md border text-gray-700 hover:bg-gray-50" title="Offline Videos" aria-label="Offline Videos">📱</Link>
						<Link to="/student/settings" className="p-2 rounded-md border text-gray-700 hover:bg-gray-50" title="Settings" aria-label="Settings">⚙️</Link>
						<button 
							onClick={() => setShowChatBot(!showChatBot)}
							ClassName={`px-2 sm:px-3 py-1.5 rounded-md text-white text-xs sm:text-sm transition-colors ${
								showChatBot ? 'bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'
							}`}
						>
							<span className="hidden sm:inline">🤖 AI Bot</span>
							<span className="sm:hidden">🤖</span>
						</button>
						<button className="p-2 rounded-md border text-gray-600">🔔</button>
						<div className="w-8 h-8 rounded-full bg-indigo-100 grid place-items-center text-indigo-700 font-semibold">S</div>
					</div>
				</div>
			</nav>

			<main className="max-w-6xl mx-auto px-4 py-5 space-y-6">
				{/* Quick Actions */}
				<section className="mb-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Link 
							to="/student/study-dashboard"
							className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow"
						>
							<div className="flex items-center gap-4">
								<div className="p-3 bg-purple-100 rounded-lg">
									<span className="text-2xl">📚</span>
								</div>
								<div>
									<h3 className="font-semibold text-lg text-gray-900">Study Analytics</h3>
									<p className="text-gray-600 text-sm">Track progress and get recommendations</p>
								</div>
							</div>
						</Link>
						<Link 
							to="/student/offline-videos"
							className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow"
						>
							<div className="flex items-center gap-4">
								<div className="p-3 bg-green-100 rounded-lg">
									<span className="text-2xl">📱</span>
								</div>
								<div>
									<h3 className="font-semibold text-lg text-gray-900">Offline Videos</h3>
									<p className="text-gray-600 text-sm">Watch videos without internet</p>
								</div>
							</div>
						</Link>
						<div className="bg-white p-6 rounded-xl shadow-sm border">
							<div className="flex items-center gap-4">
								<div className="p-3 bg-blue-100 rounded-lg">
									<span className="text-2xl">⚡</span>
								</div>
								<div>
									<h3 className="font-semibold text-lg text-gray-900">Quick Stats</h3>
									<p className="text-gray-600 text-sm">Overall learning progress</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* My Courses */}
				<section>
					<h2 className="text-sm font-semibold text-gray-800">Video Courses</h2>
					<div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{courses.map((c) => (
							<div key={c.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedCourse(c)}>
								<div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center text-4xl text-white relative">
									{c.thumb}
									<div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">{c.duration}</div>
									<div className="absolute top-2 left-2 bg-white bg-opacity-90 text-gray-800 text-xs px-2 py-1 rounded">{c.lessons} lessons</div>
									<div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
										<div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
											<div className="w-0 h-0 border-l-4 border-l-gray-800 border-y-2 border-y-transparent ml-1"></div>
										</div>
									</div>
								</div>
								<div className="p-4">
									<h3 className="font-semibold leading-tight">{c.title}</h3>
									<p className="text-xs text-gray-500 mt-1">{c.grade}</p>
									<p className="text-sm text-gray-600 mt-2 line-clamp-2">{c.description}</p>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* Downloads */}
				<section>
					<h2 className="text-sm font-semibold text-gray-800">Downloads & Resources</h2>
					<div className="mt-3 space-y-3">
						{downloads.map((d) => (
							<div key={d.id} className="bg-white rounded-xl shadow-sm border p-4">
								<div className="flex items-start gap-3">
									<div className={`w-10 h-10 rounded-md grid place-items-center text-lg ${
										d.type === 'video' ? 'bg-red-50 text-red-600' :
										d.type === 'pdf' ? 'bg-blue-50 text-blue-600' :
										'bg-green-50 text-green-600'
									}`}>
										{d.type === 'video' ? '🎥' : d.type === 'pdf' ? '📄' : '🎮'}
									</div>
									<div className="flex-1">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm font-semibold leading-tight">{d.title}</p>
												<p className="text-xs text-gray-500">{d.meta}</p>
											</div>
											<button 
												onClick={() => handleDownload(d)}
												className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
													d.done 
														? 'bg-emerald-600 text-white hover:bg-emerald-700' 
														: d.progress > 0 
															? 'bg-gray-300 text-gray-500 cursor-not-allowed'
															: 'bg-indigo-600 text-white hover:bg-indigo-700'
												}`}
												disabled={d.progress > 0 && d.progress < 100}
											>
												{d.done ? 'Download ⬇️' : d.progress > 0 ? `${Math.round(d.progress)}%` : 'Start Download'}
											</button>
										</div>
										{!d.done && d.progress > 0 && (
											<div className="mt-2">
												<div className="w-full bg-gray-200 rounded-full h-2">
													<div 
														className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
														style={{ width: `${d.progress}%` }}
													></div>
												</div>
												<p className="text-xs text-gray-500 mt-1">Downloading... {Math.round(d.progress)}%</p>
											</div>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* Gamified Learning */}
				<section>
					<h2 className="text-sm font-semibold text-gray-800">Gamified Learning</h2>
					<div className="mt-3 bg-white rounded-xl shadow-sm border p-4">
						<p className="text-sm font-medium text-gray-700">Weekly Progress</p>
						<div className="mt-2 h-2 bg-gray-200 rounded-full">
							<div className="h-2 bg-indigo-600 rounded-full" style={{ width: '75%' }} />
						</div>
						<div className="mt-4 grid grid-cols-2 gap-3 items-center">
							<div>
								<p className="text-xs text-gray-500">My Badges</p>
								<div className="mt-2 flex items-center gap-2">
									<span className="w-8 h-8 rounded-full bg-amber-100 grid place-items-center">🏅</span>
									<span className="w-8 h-8 rounded-full bg-emerald-100 grid place-items-center">🌿</span>
									<span className="w-8 h-8 rounded-full bg-sky-100 grid place-items-center">📚</span>
								</div>
							</div>
							<div className="text-right space-x-2">
								<Link to="/games/quiz" className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm inline-block">Play Quiz</Link>
								<Link to="/games/match" className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm inline-block">Word Match</Link>
							</div>
						</div>
					</div>
				</section>

				{/* AI Bot - Responsive Section */}
				{showChatBot && (
					<section className="fixed inset-0 z-50 bg-black bg-opacity-50 md:relative md:bg-transparent md:inset-auto">
						<div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] md:relative md:rounded-xl md:max-h-none md:shadow-sm md:border">
							{/* Mobile Header */}
							<div className="flex items-center justify-between p-4 border-b md:hidden">
								<h2 className="text-lg font-semibold text-gray-800">AI Teacher Bot</h2>
								<button 
									onClick={() => setShowChatBot(false)}
									ClassName="p-2 rounded-full hover:bg-gray-100 transition-colors"
								>
									✕
								</button>
							</div>
							
							{/* Desktop Header */}
							<div className="hidden md:block p-4 pb-0">
								<div className="flex items-center justify-between">
									<h2 className="text-sm font-semibold text-gray-800">AI Teacher Bot</h2>
									<button 
										onClick={() => setShowChatBot(false)}
										ClassName="text-gray-400 hover:text-gray-600 transition-colors"
									>
										✕
									</button>
								</div>
							</div>

							{/* Chat Messages */}
							<div className="flex-1 overflow-auto p-4 space-y-3 min-h-[300px] max-h-[50vh] md:max-h-80">
								{chat.length === 0 ? (
									<div className="text-center text-gray-500 py-8">
										<div className="text-4xl mb-2">🤖</div>
										<p className="text-sm">Ask me anything about your studies!</p>
										<p className="text-xs mt-1">You can also upload images for help</p>
									</div>
								) : (
									chat.map((m, i) => (
										<div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
											<div className={`max-w-[80%] sm:max-w-[70%] px-3 py-2 rounded-2xl text-sm ${m.role==='user' 
												? 'bg-indigo-600 text-white rounded-br-md' 
												: 'bg-gray-100 text-gray-800 rounded-bl-md'
											}`}>
												{m.text}
											</div>
										</div>
									))
								)}
								{busy && (
									<div className="flex justify-start">
										<div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-bl-md text-sm text-gray-600">
											<div className="flex items-center gap-1">
												<div className="flex space-x-1">
													<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
													<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
													<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
												</div>
												Thinking...
											</div>
										</div>
									</div>
								)}
							</div>

							{/* Input Area */}
							<div className="border-t bg-white p-4 rounded-b-2xl md:rounded-b-xl">
								{imageBase64 && (
									<div className="mb-3 p-2 bg-gray-50 rounded-lg flex items-center justify-between">
										<span className="text-sm text-gray-600">📷 Image attached</span>
										<button 
											onClick={() => setImageBase64(undefined)}
											ClassName="text-red-500 hover:text-red-700 transition-colors"
										>
											✕
										</button>
									</div>
								)}
								
								<div className="flex items-end gap-2">
									<div className="flex-1 relative">
										<input 
											value={prompt} 
											onChange={(e) => setPrompt(e.target.value)}
											onKeyPress={(e) => e.key === 'Enter' && !busy && askAI()}
											className="w-full border border-gray-300 rounded-2xl px-4 py-3 pr-12 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all" 
											placeholder="Ask a question or describe what you need help with..."
											disabled={busy}
										/>
										<button 
											onClick={() => fileInputRef.current?.click()}
											className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
											title="Attach image"
										>
											📷
										</button>
										<input 
											ref={fileInputRef}
											type="file" 
											accept="image/*" 
											onChange={async (e) => {
												const f = e.target.files?.[0]
												if (f) {
													setImageBase64(await toBase64(f))
												}
											}} 
											className="hidden"
										/>
									</div>
									<button 
										disabled={busy || (!prompt.trim() && !imageBase64)} 
										onClick={askAI}
										className={`px-4 py-3 rounded-2xl font-medium transition-all ${
											busy || (!prompt.trim() && !imageBase64)
												? 'bg-gray-300 text-gray-500 cursor-not-allowed'
												: 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
										}`}
									>
										{busy ? (
											<div className="flex items-center gap-2">
												<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
												Sending
											</div>
										) : (
											<div className="flex items-center gap-1">
												Send
												<span className="transform rotate-45">📤</span>
											</div>
										)}
									</button>
								</div>
							</div>
						</div>
					</section>
				)}
			</main>

			{/* Floating Action Button for Mobile */}
			{!showChatBot && (
				<button
					onClick={() => setShowChatBot(true)}
					className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40 md:hidden flex items-center justify-center active:scale-95"
					aria-label="Open AI Chat Bot"
				>
					<span className="text-2xl">🤖</span>
				</button>
			)}

			{/* Video Course Modal */}
			{selectedCourse && (
				<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
						<div className="p-6">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-bold">{selectedCourse.title}</h2>
								<button 
									onClick={() => setSelectedCourse(null)}
									className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
								>
									✕
								</button>
							</div>
							
							<div className="aspect-video mb-4">
								<iframe 
									src={selectedCourse.videoUrl}
									className="w-full h-full rounded-lg"
									allowFullScreen
									title={selectedCourse.title}
								></iframe>
							</div>
							
							<div className="grid md:grid-cols-2 gap-6">
								<div>
									<h3 className="font-semibold mb-2">About This Course</h3>
									<p className="text-gray-600 mb-4">{selectedCourse.description}</p>
									
									<div className="flex items-center gap-4 text-sm text-gray-500">
										<span>🕰️ {selectedCourse.duration}</span>
										<span>📚 {selectedCourse.lessons} lessons</span>
										<span>🎆 {selectedCourse.grade}</span>
									</div>
								</div>
								
								<div>
									<h3 className="font-semibold mb-2">Course Lessons</h3>
									<div className="space-y-2">
										{Array.from({length: selectedCourse.lessons}).map((_, i) => (
											<div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
												<div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
													{i + 1}
												</div>
												<div className="flex-1">
													<p className="text-sm font-medium">Lesson {i + 1}: {selectedCourse.title.split(' ').slice(-2).join(' ')} Part {i + 1}</p>
													<p className="text-xs text-gray-500">{Math.floor(Math.random() * 10) + 3} minutes</p>
												</div>
												<button className="text-indigo-600 hover:text-indigo-700">
													▶️
												</button>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
