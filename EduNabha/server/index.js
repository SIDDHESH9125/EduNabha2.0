import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import twilio from 'twilio'
import { OAuth2Client } from 'google-auth-library'
import { PrismaClient } from '@prisma/client'
import fileUpload from 'express-fileupload'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const prisma = new PrismaClient()

app.use(cors({
	origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json({ limit: '5mb' }))
app.use(fileUpload({
	limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
	useTempFiles: true,
	tempFileDir: '/tmp/'
}))
app.use('/videos', express.static(path.join(__dirname, 'uploads/videos')))

const JWT_SECRET = 'dev-secret' // replace for production
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null

// in-memory store (replace with DB)
const users = []
const otps = new Map()
const verifiedPhones = new Set()

function createToken(user){
	return jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' })
}
function generateOtp(){
	return String(Math.floor(100000 + Math.random()*900000))
}

function getTwilio(){
	const sid = process.env.TWILIO_ACCOUNT_SID
	const token = process.env.TWILIO_AUTH_TOKEN
	const from = process.env.TWILIO_PHONE_FROM
	if (sid && token && from) {
		return { client: twilio(sid, token), from }
	}
	return null
}

// Helper function to call Python video database integration
function callPythonIntegration(command, data = null) {
	return new Promise((resolve, reject) => {
		const args = [path.join(__dirname, '../video_integration_wrapper.py'), command]
		if (data) {
			args.push(JSON.stringify(data))
		}

		const python = spawn('python', args)
		let result = ''
		let error = ''

		python.stdout.on('data', (data) => {
			result += data.toString()
		})

		python.stderr.on('data', (data) => {
			error += data.toString()
		})

		python.on('close', (code) => {
			if (code === 0) {
				try {
					resolve(JSON.parse(result))
				} catch (parseError) {
					console.error('Failed to parse Python response:', result)
					reject(new Error(`Failed to parse Python response: ${result}`))
				}
			} else {
				console.error('Python script error:', error)
				reject(new Error(`Python script failed: ${error || 'Unknown error'}`))
			}
		})
	})
}

function generateEducationalFallback(prompt, imageBase64) {
	if (imageBase64) {
		return '📷 I can see you\'ve shared an image! While I can\'t analyze it right now, here are some tips: For math problems, try breaking them into smaller steps. For text, read carefully and identify key concepts. Feel free to type out your question and I\'ll do my best to help!'
	}
	
	const lowerPrompt = prompt?.toLowerCase() || ''
	
	// Math-related responses
	if (lowerPrompt.includes('math') || lowerPrompt.includes('equation') || lowerPrompt.includes('solve') || lowerPrompt.includes('calculate')) {
		return '🧮 Math help: Break problems into steps! 1) Identify what you know 2) Determine what you need to find 3) Choose the right formula 4) Solve step by step 5) Check your answer. What specific math topic are you working on?'
	}
	
	// Science-related responses  
	if (lowerPrompt.includes('science') || lowerPrompt.includes('biology') || lowerPrompt.includes('chemistry') || lowerPrompt.includes('physics')) {
		return '🔬 Science tip: Start with the basics! Define key terms, understand the process or concept, then apply it to examples. What science topic would you like to explore?'
	}
	
	// General study help
	if (lowerPrompt.includes('study') || lowerPrompt.includes('learn') || lowerPrompt.includes('help')) {
		return '📚 Study strategies: 1) Active reading with notes 2) Practice problems 3) Teach concepts to others 4) Use visual aids 5) Take regular breaks. What subject are you studying?'
	}
	
	// Default encouraging response
	return `🤖 I\'m here to help with your studies! While my advanced AI is temporarily unavailable, I can still provide study tips and guidance. Could you tell me more about what you\'re working on? For example: "Help me with algebra" or "Explain photosynthesis" or "Study tips for history".`
}

app.post('/api/ai/ask', async (req, res) => {
	try {
		const { prompt, imageBase64 } = req.body
		if (!prompt && !imageBase64) return res.status(400).json({ message: 'Prompt or image required' })
		// If OPENAI key exists, attempt a lightweight call to Responses API (text-only fallback)
		if (OPENAI_API_KEY) {
			try {
				const payload = {
					model: 'gpt-4o-mini',
					messages: imageBase64 ? [{
						role: 'user',
						content: [
							{ type: 'text', text: prompt || 'Describe this image' },
							{ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
						]
					}] : [{ role: 'user', content: prompt }],
					max_tokens: 1000
				}
				const r = await fetch('https://api.openai.com/v1/chat/completions', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
					body: JSON.stringify(payload),
				})
				const data = await r.json()
				if (!r.ok) {
					console.error('OpenAI API error:', data)
					throw new Error(data.error?.message || 'OpenAI API request failed')
				}
				const answer = data?.choices?.[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.'
				return res.json({ answer })
			} catch (e) {
				console.error('AI provider failed, using fallback', e)
				// Check for specific OpenAI errors
				if (e.message && e.message.includes('429')) {
					return res.json({ answer: '⏰ I\'m experiencing high demand right now. Please try again in a moment, or ask me something different!' })
				}
				if (e.message && e.message.includes('401')) {
					return res.json({ answer: '🔑 There\'s an issue with my AI configuration. Let me try to help you anyway!' })
				}
				if (e.message && e.message.includes('insufficient_quota')) {
					return res.json({ answer: '💳 My AI quota is currently exhausted. I\'ll use my basic knowledge to help you instead!' })
				}
			}
		}
		// Fallback educational responses
		const answer = generateEducationalFallback(prompt, imageBase64)
		return res.json({ answer })
	} catch (e) {
		return res.status(500).json({ message: 'AI error' })
	}
})

app.post('/api/auth/google', async (req, res) => {
	try {
		if (!googleClient) return res.status(500).json({ message: 'Google not configured' })
		const { credential, role } = req.body
		const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID })
		const payload = ticket.getPayload()
		if (!payload?.email) return res.status(400).json({ message: 'Invalid Google token' })
		let user = users.find(u => u.email === payload.email)
		if (!user) {
			user = { id: uuid(), role: role || 'student', email: payload.email, password: '', name: payload.name || payload.email.split('@')[0], profile: { google: true } }
			users.push(user)
		}
		const token = createToken(user)
		return res.json({ token, user: { id: user.id, role: user.role, name: user.name, email: user.email, profile: user.profile } })
	} catch (e) {
		console.error(e)
		return res.status(401).json({ message: 'Google verification failed' })
	}
})

app.post('/api/auth/otp/send', async (req, res) => {
	const { phone } = req.body
	if (!phone) return res.status(400).json({ message: 'Phone required' })
	const code = generateOtp()
	const expiresAt = Date.now() + 5 * 60 * 1000
	otps.set(phone, { code, expiresAt })

	const tw = getTwilio()
	try {
		if (tw) {
			await tw.client.messages.create({ to: phone, from: tw.from, body: `Your EduNabha OTP is ${code}` })
		} else {
			console.log(`[OTP] ${phone} -> ${code}`)
		}
		return res.json({ message: 'OTP sent' })
	} catch (e) {
		console.error('Twilio send failed', e)
		return res.status(500).json({ message: 'Failed to send OTP' })
	}
})

app.post('/api/auth/otp/verify', (req, res) => {
	const { phone, code } = req.body
	const rec = otps.get(phone)
	if (!rec) return res.status(400).json({ message: 'No OTP for this phone' })
	if (rec.expiresAt < Date.now()) return res.status(400).json({ message: 'OTP expired' })
	if (rec.code !== String(code)) return res.status(400).json({ message: 'Invalid OTP' })
	verifiedPhones.add(phone)
	otps.delete(phone)
	return res.json({ verified: true })
})

app.post('/api/auth/signup', async (req, res) => {
	try {
		const { role, email, password, profile } = req.body
		if (!role || !email || !password) return res.status(400).json({ message: 'Missing fields' })
		
		// Check if user exists in database
		const existingUser = await prisma.user.findUnique({ where: { email } })
		if (existingUser) return res.status(409).json({ message: 'Email already exists' })
		
		const hash = await bcrypt.hash(password, 10)
		
		// Create user in database
		const user = await prisma.user.create({
			data: {
				email,
				name: profile?.name || email.split('@')[0],
				role,
				profile: profile ? JSON.stringify(profile) : null
			}
		})
		
		// Also add to in-memory users for backward compatibility
		users.push({ id: user.id, role: user.role, email: user.email, password: hash, name: user.name, profile })
		
		const token = createToken(user)
		return res.json({ token, user: { id: user.id, role: user.role, name: user.name, email: user.email, profile: profile || {} } })
	} catch (e) {
		console.error('Signup error:', e)
		return res.status(500).json({ message: 'Server error' })
	}
})

app.post('/api/auth/login', async (req, res) => {
	try {
		const { email, password } = req.body
		const user = users.find(u => u.email === email)
		if (!user) return res.status(401).json({ message: 'Invalid credentials' })
		const ok = await bcrypt.compare(password, user.password)
		if (!ok) return res.status(401).json({ message: 'Invalid credentials' })
		const token = createToken(user)
		return res.json({ token, user: { id: user.id, role: user.role, name: user.name, email: user.email, profile: user.profile } })
	} catch (e) {
		return res.status(500).json({ message: 'Server error' })
	}
})

function auth(req, res, next){
	const header = req.headers.authorization
	if (!header) return res.status(401).json({ message: 'No token' })
	const token = header.replace('Bearer ', '')
	try {
		const payload = jwt.verify(token, JWT_SECRET)
		req.user = payload
		next()
	} catch (e) {
		return res.status(401).json({ message: 'Invalid token' })
	}
}

app.get('/api/me', auth, (req, res) => {
	return res.json({ user: req.user })
})

// Video and Course Management APIs
app.get('/api/courses', async (req, res) => {
	try {
		const courses = await prisma.course.findMany({
			include: {
				videos: true,
				_count: { select: { videos: true } }
			}
		})
		return res.json(courses)
	} catch (e) {
		console.error('Error fetching courses:', e)
		return res.status(500).json({ message: 'Server error' })
	}
})

app.post('/api/courses', auth, async (req, res) => {
	try {
		const { title, description, category, grade, duration, lessons, thumbnailUrl } = req.body
		const course = await prisma.course.create({
			data: { title, description, category, grade, duration, lessons, thumbnailUrl }
		})
		return res.json(course)
	} catch (e) {
		console.error('Error creating course:', e)
		return res.status(500).json({ message: 'Server error' })
	}
})

// Video upload and storage
app.post('/api/videos/upload', auth, async (req, res) => {
	try {
		if (!req.files || !req.files.video) {
			return res.status(400).json({ message: 'No video file uploaded' })
		}

		const videoFile = req.files.video
		const { title, description, courseId, quality = '720p' } = req.body

		// Generate unique filename
		const fileName = `${Date.now()}-${videoFile.name}`
		const filePath = path.join(__dirname, 'uploads/videos', fileName)

		// Move file to storage
		await videoFile.mv(filePath)

		// Get file stats
		const stats = fs.statSync(filePath)

		// Save to database
		const video = await prisma.video.create({
			data: {
				title,
				description,
				duration: 0, // Will be updated when we get video metadata
				fileSize: stats.size,
				fileName,
				filePath: `/videos/${fileName}`,
				mimeType: videoFile.mimetype,
				quality,
				isDownloaded: true,
				courseId
			}
		})

		return res.json({ message: 'Video uploaded successfully', video })
	} catch (e) {
		console.error('Error uploading video:', e)
		return res.status(500).json({ message: 'Upload failed' })
	}
})

// Download video for offline access
app.post('/api/videos/:videoId/download', auth, async (req, res) => {
	try {
		const { videoId } = req.params
		const userId = req.user.id

		// Check if video exists
		const video = await prisma.video.findUnique({ where: { id: videoId } })
		if (!video) return res.status(404).json({ message: 'Video not found' })

		// Check if already downloading or downloaded
		let download = await prisma.userDownload.findUnique({
			where: { userId_videoId: { userId, videoId } }
		})

		if (!download) {
			// Create new download record
			download = await prisma.userDownload.create({
				data: {
					userId,
					videoId,
					status: 'pending',
					fileSizeMB: video.fileSize / (1024 * 1024)
				}
			})
		}

		// Simulate download process (in real app, this would handle actual download)
		if (download.status !== 'completed') {
			// Update status to downloading
			download = await prisma.userDownload.update({
				where: { id: download.id },
				data: { status: 'downloading', progress: 0 }
			})

			// Simulate progress updates
			setTimeout(async () => {
				try {
					await prisma.userDownload.update({
						where: { id: download.id },
						data: { status: 'completed', progress: 100, downloadedAt: new Date() }
					})

					// Enhance with Python database integration
					try {
						const videoWithCourse = await prisma.video.findUnique({
							where: { id: videoId },
							include: { course: true }
						})

						if (videoWithCourse) {
							const videoData = {
								title: videoWithCourse.title,
								description: videoWithCourse.description || '',
								duration: videoWithCourse.duration || 0,
								fileSize: videoWithCourse.fileSize || 0,
								filePath: videoWithCourse.filePath || '',
								quality: videoWithCourse.quality || 'HD',
								course: {
									title: videoWithCourse.course?.title || 'Unknown Course',
									category: videoWithCourse.course?.category || 'General'
								}
							}

							await callPythonIntegration('add_video', videoData)
							console.log('Video enhanced with database integration:', videoWithCourse.title)
						}
					} catch (enhanceError) {
						console.error('Enhancement error (non-critical):', enhanceError.message)
						// Don't fail the download if enhancement fails
					}
				} catch (e) {
					console.error('Error updating download status:', e)
				}
			}, 5000) // Complete after 5 seconds
		}

		return res.json({ message: 'Download started', download })
	} catch (e) {
		console.error('Error starting download:', e)
		return res.status(500).json({ message: 'Download failed' })
	}
})

// Get user's downloads
app.get('/api/downloads', auth, async (req, res) => {
	try {
		const userId = req.user.id
		const downloads = await prisma.userDownload.findMany({
			where: { userId },
			include: {
				video: { include: { course: true } },
				course: true
			},
			orderBy: { createdAt: 'desc' }
		})
		return res.json(downloads)
	} catch (e) {
		console.error('Error fetching downloads:', e)
		return res.status(500).json({ message: 'Server error' })
	}
})

// Get offline videos
app.get('/api/videos/offline', auth, async (req, res) => {
	try {
		const userId = req.user.id
		const offlineVideos = await prisma.userDownload.findMany({
			where: { 
				userId, 
				status: 'completed',
				video: { isDownloaded: true }
			},
			include: {
				video: { include: { course: true } }
			}
		})
		return res.json(offlineVideos)
	} catch (e) {
		console.error('Error fetching offline videos:', e)
		return res.status(500).json({ message: 'Server error' })
	}
})

// Update video progress
app.post('/api/videos/:videoId/progress', auth, async (req, res) => {
	try {
		const { videoId } = req.params
		const { watchTime, completed } = req.body
		const userId = req.user.id

		const progress = await prisma.userProgress.upsert({
			where: { userId_videoId: { userId, videoId } },
			update: { watchTime, completed, lastWatched: new Date() },
			create: { userId, videoId, watchTime, completed }
		})

		return res.json(progress)
	} catch (e) {
		console.error('Error updating progress:', e)
		return res.status(500).json({ message: 'Server error' })
	}
})

// Storage management
app.get('/api/storage/info', auth, async (req, res) => {
	try {
		const userId = req.user.id
		
		// Get user's downloads
		const downloads = await prisma.userDownload.findMany({
			where: { userId, status: 'completed' },
			include: { video: true }
		})

		const totalSize = downloads.reduce((sum, d) => sum + (d.video?.fileSize || 0), 0)
		const videoCount = downloads.length

		return res.json({
			totalSizeBytes: totalSize,
			totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
			videoCount,
			downloads: downloads.map(d => ({
				id: d.id,
				title: d.video?.title,
				sizeMB: Math.round((d.video?.fileSize || 0) / (1024 * 1024) * 100) / 100,
				downloadedAt: d.downloadedAt
			}))
		})
	} catch (e) {
		console.error('Error fetching storage info:', e)
		return res.status(500).json({ message: 'Server error' })
	}
})

// Delete offline video
app.delete('/api/videos/:videoId/offline', auth, async (req, res) => {
	try {
		const { videoId } = req.params
		const userId = req.user.id

		// Find and delete download record
		const download = await prisma.userDownload.findUnique({
			where: { userId_videoId: { userId, videoId } },
			include: { video: true }
		})

		if (!download) {
			return res.status(404).json({ message: 'Download not found' })
		}

		// Delete from database
		await prisma.userDownload.delete({
			where: { id: download.id }
		})

		// Note: In a real app, you'd also delete the physical file if no other users have it

		return res.json({ message: 'Video removed from offline storage' })
	} catch (e) {
		console.error('Error deleting offline video:', e)
		return res.status(500).json({ message: 'Server error' })
	}
})

// Enhanced Video Database Integration Endpoints

// Study dashboard endpoint
app.get('/api/study/dashboard', auth, async (req, res) => {
	try {
		const dashboard = await callPythonIntegration('get_study_dashboard')
		res.json(dashboard)
	} catch (error) {
		console.error('Error getting study dashboard:', error)
		res.status(500).json({ error: error.message })
	}
})

// Study recommendations endpoint
app.get('/api/study/recommendations', auth, async (req, res) => {
	try {
		const recommendations = await callPythonIntegration('get_recommendations')
		res.json(recommendations)
	} catch (error) {
		console.error('Error getting recommendations:', error)
		res.status(500).json({ error: error.message })
	}
})

// Enhanced offline videos endpoint - fallback to Python if available
app.get('/api/videos/offline/enhanced', auth, async (req, res) => {
	try {
		const enhancedVideos = await callPythonIntegration('get_offline_videos')
		res.json(enhancedVideos)
	} catch (error) {
		console.error('Error getting enhanced offline videos (using fallback):', error)
		// Fallback to existing implementation
		const userId = req.user.id
		const offlineVideos = await prisma.userDownload.findMany({
			where: { 
				userId, 
				status: 'completed',
				video: { isDownloaded: true }
			},
			include: {
				video: { include: { course: true } }
			}
		})
		res.json(offlineVideos)
	}
})

// Enhanced storage info endpoint
app.get('/api/storage/enhanced', auth, async (req, res) => {
	try {
		const enhancedStorageInfo = await callPythonIntegration('get_storage_info')
		res.json(enhancedStorageInfo)
	} catch (error) {
		console.error('Error getting enhanced storage info (using fallback):', error)
		// Fallback to existing implementation
		const userId = req.user.id
		
		const downloads = await prisma.userDownload.findMany({
			where: { userId, status: 'completed' },
			include: { video: true }
		})

		const totalSize = downloads.reduce((sum, d) => sum + (d.video?.fileSize || 0), 0)
		const videoCount = downloads.length

		res.json({
			totalSizeBytes: totalSize,
			totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
			videoCount,
			downloads: downloads.map(d => ({
				id: d.id,
				title: d.video?.title,
				sizeMB: Math.round((d.video?.fileSize || 0) / (1024 * 1024) * 100) / 100,
				downloadedAt: d.downloadedAt
			}))
		})
	}
})

// Enhanced video progress endpoint
app.post('/api/videos/:videoId/progress/enhanced', auth, async (req, res) => {
	try {
		const { videoId } = req.params
		const { watchTime, completed } = req.body

		// Update in Prisma database first
		const progress = await prisma.userProgress.upsert({
			where: { userId_videoId: { userId: req.user.id, videoId } },
			update: { watchTime, completed, lastWatched: new Date() },
			create: { userId: req.user.id, videoId, watchTime, completed }
		})

		// Then enhance with Python database
		try {
			const progressData = { videoId, watchTime, completed }
			const result = await callPythonIntegration('update_progress', progressData)
			
			if (result.success) {
				res.json({ success: true, progress, enhanced: result.video })
			} else {
				res.json({ success: true, progress, enhanced: null, error: result.error })
			}
		} catch (enhanceError) {
			console.error('Enhancement error (non-critical):', enhanceError.message)
			res.json({ success: true, progress, enhanced: null })
		}
	} catch (error) {
		console.error('Error updating enhanced progress:', error)
		res.status(500).json({ error: error.message })
	}
})

// Enhanced video search endpoint
app.get('/api/videos/search', auth, async (req, res) => {
	try {
		const query = req.query.q || ''
		const filters = {
			category_id: req.query.category ? parseInt(req.query.category) : null,
			tag: req.query.tag || null,
			rating: req.query.rating ? parseInt(req.query.rating) : null
		}

		const searchData = { query, filters }
		const results = await callPythonIntegration('search_videos', searchData)
		
		res.json(results)
	} catch (error) {
		console.error('Error searching videos:', error)
		res.status(500).json({ error: error.message })
	}
})

// Study data export endpoint
app.get('/api/study/export', auth, async (req, res) => {
	try {
		const format = req.query.format || 'json'
		const filename = await callPythonIntegration('export_study_data', { format })
		
		if (filename) {
			const filePath = path.join(__dirname, '..', filename)
			if (fs.existsSync(filePath)) {
				res.download(filePath, (err) => {
					if (!err) {
						// Clean up the file after download
						fs.unlink(filePath, () => {})
					}
				})
			} else {
				res.status(404).json({ error: 'Export file not found' })
			}
		} else {
			res.status(400).json({ error: 'Export failed' })
		}
	} catch (error) {
		console.error('Error exporting study data:', error)
		res.status(500).json({ error: error.message })
	}
})

console.log('Enhanced video database integration endpoints loaded!')
console.log('Available enhanced endpoints:')
console.log('  - GET  /api/study/dashboard')
console.log('  - GET  /api/study/recommendations')
console.log('  - GET  /api/videos/offline/enhanced')
console.log('  - GET  /api/storage/enhanced')
console.log('  - POST /api/videos/:id/progress/enhanced')
console.log('  - GET  /api/videos/search')
console.log('  - GET  /api/study/export')

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`))
