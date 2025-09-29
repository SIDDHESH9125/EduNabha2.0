import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const QUESTION_CATEGORIES = {
	math: [
		{ q: 'What is 3/4 + 1/4?', options: ['1', '3/4', '1/2', '2'], a: 0, category: 'Mathematics' },
		{ q: 'What is the area of a rectangle with length 8 and width 5?', options: ['40', '13', '30', '35'], a: 0, category: 'Mathematics' },
		{ q: 'Solve for x: 2x + 6 = 16', options: ['5', '4', '6', '3'], a: 0, category: 'Mathematics' },
		{ q: 'What is 15% of 200?', options: ['30', '25', '35', '20'], a: 0, category: 'Mathematics' }
	],
	science: [
		{ q: 'Plant makes food by?', options: ['Respiration', 'Photosynthesis', 'Digestion', 'Transpiration'], a: 1, category: 'Biology' },
		{ q: 'What is the chemical symbol for water?', options: ['H2O', 'CO2', 'NaCl', 'O2'], a: 0, category: 'Chemistry' },
		{ q: 'Which planet is closest to the Sun?', options: ['Venus', 'Mercury', 'Earth', 'Mars'], a: 1, category: 'Physics' },
		{ q: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Cytoplasm'], a: 2, category: 'Biology' }
	],
	general: [
		{ q: 'What is the capital of France?', options: ['London', 'Berlin', 'Paris', 'Madrid'], a: 2, category: 'Geography' },
		{ q: 'Who wrote "Romeo and Juliet"?', options: ['Charles Dickens', 'William Shakespeare', 'Mark Twain', 'Jane Austen'], a: 1, category: 'Literature' },
		{ q: 'In which year did World War II end?', options: ['1944', '1945', '1946', '1943'], a: 1, category: 'History' },
		{ q: 'What is the largest ocean on Earth?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], a: 3, category: 'Geography' }
	]
}

export default function Quiz() {
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
	const [questions, setQuestions] = useState<any[]>([])
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
	const [score, setScore] = useState(0)
	const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
	const [showResult, setShowResult] = useState(false)
	const [gameCompleted, setGameCompleted] = useState(false)
	const [timeLeft, setTimeLeft] = useState(30)
	const [isTimerActive, setIsTimerActive] = useState(false)

	useEffect(() => {
		let timer: NodeJS.Timeout
		if (isTimerActive && timeLeft > 0 && !showResult && !gameCompleted) {
			timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
		} else if (timeLeft === 0 && !showResult) {
			handleAnswer(-1) // Time's up, wrong answer
		}
		return () => clearTimeout(timer)
	}, [timeLeft, isTimerActive, showResult, gameCompleted])

	function startQuiz(category: string) {
		const categoryQuestions = QUESTION_CATEGORIES[category as keyof typeof QUESTION_CATEGORIES]
		setQuestions(categoryQuestions)
		setSelectedCategory(category)
		setCurrentQuestionIndex(0)
		setScore(0)
		setTimeLeft(30)
		setIsTimerActive(true)
		setGameCompleted(false)
	}

	function handleAnswer(answerIndex: number) {
		if (selectedAnswer !== null) return // Prevent multiple answers
		
		setSelectedAnswer(answerIndex)
		setShowResult(true)
		setIsTimerActive(false)
		
		if (answerIndex === questions[currentQuestionIndex].a) {
			setScore(score + 1)
		}
		
		setTimeout(() => {
			if (currentQuestionIndex + 1 < questions.length) {
				setCurrentQuestionIndex(currentQuestionIndex + 1)
				setSelectedAnswer(null)
				setShowResult(false)
				setTimeLeft(30)
				setIsTimerActive(true)
			} else {
				setGameCompleted(true)
			}
		}, 2000)
	}

	function resetQuiz() {
		setSelectedCategory(null)
		setQuestions([])
		setCurrentQuestionIndex(0)
		setScore(0)
		setSelectedAnswer(null)
		setShowResult(false)
		setGameCompleted(false)
		setTimeLeft(30)
		setIsTimerActive(false)
	}

	function getScoreMessage(score: number, total: number) {
		const percentage = (score / total) * 100
		if (percentage >= 80) return { message: "🏆 Excellent! You're a quiz master!", color: "text-green-600" }
		if (percentage >= 60) return { message: "👍 Good job! Keep it up!", color: "text-blue-600" }
		if (percentage >= 40) return { message: "📚 Not bad! Study a bit more!", color: "text-yellow-600" }
		return { message: "💪 Keep practicing! You'll get better!", color: "text-red-600" }
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<Link to="/student" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4">
						← Back to Dashboard
					</Link>
					<h1 className="text-4xl font-bold text-gray-800 mb-2">🧠 Interactive Quiz</h1>
					<p className="text-gray-600">Test your knowledge and challenge yourself!</p>
				</div>

				{!selectedCategory ? (
					/* Category Selection */
					<div className="grid md:grid-cols-3 gap-6">
						{Object.entries(QUESTION_CATEGORIES).map(([key, questions]) => (
							<div key={key} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => startQuiz(key)}>
								<div className="text-center">
									<div className="text-4xl mb-4">
										{key === 'math' ? '🧮' : key === 'science' ? '🔬' : '🌍'}
									</div>
									<h3 className="text-xl font-semibold mb-2 capitalize">{key === 'math' ? 'Mathematics' : key === 'science' ? 'Science' : 'General Knowledge'}</h3>
									<p className="text-gray-600 mb-4">{questions.length} Questions</p>
									<div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium">
										Click to Start
									</div>
								</div>
							</div>
						))}
					</div>
				) : gameCompleted ? (
					/* Final Results */
					<div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-2xl mx-auto">
						<div className="text-6xl mb-4">🎉</div>
						<h2 className="text-3xl font-bold mb-4">Quiz Completed!</h2>
						<div className="text-5xl font-bold text-indigo-600 mb-2">{score}/{questions.length}</div>
						<p className="text-gray-600 mb-6">Final Score: {Math.round((score / questions.length) * 100)}%</p>
						<p className={`text-lg font-medium mb-8 ${getScoreMessage(score, questions.length).color}`}>
							{getScoreMessage(score, questions.length).message}
						</p>
						<div className="flex gap-4 justify-center">
							<button 
								onClick={() => startQuiz(selectedCategory)}
								className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
							>
								🔄 Play Again
							</button>
							<button 
								onClick={resetQuiz}
								className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
							>
								📚 Choose Category
							</button>
						</div>
					</div>
				) : (
					/* Quiz Game */
					<div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl mx-auto">
						{/* Progress Bar */}
						<div className="mb-6">
							<div className="flex justify-between items-center mb-2">
								<span className="text-sm font-medium text-gray-600">Question {currentQuestionIndex + 1} of {questions.length}</span>
								<span className="text-sm font-medium text-gray-600">Score: {score}/{questions.length}</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-2">
								<div 
									className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
									style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
								></div>
							</div>
						</div>

						{/* Timer */}
						<div className="flex justify-center mb-6">
							<div className={`text-2xl font-bold px-4 py-2 rounded-lg ${
								timeLeft > 10 ? 'bg-green-100 text-green-700' : 
								timeLeft > 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
							}`}>
								⏰ {timeLeft}s
							</div>
						</div>

						{/* Question */}
						<div className="mb-6">
							<div className="text-sm text-indigo-600 mb-2">{questions[currentQuestionIndex]?.category}</div>
							<h3 className="text-xl font-semibold mb-6">{questions[currentQuestionIndex]?.q}</h3>
							
							{/* Answer Options */}
							<div className="grid grid-cols-1 gap-3">
								{questions[currentQuestionIndex]?.options.map((option: string, index: number) => {
									let buttonClass = "p-4 text-left rounded-lg border-2 transition-all duration-200 "
									
									if (showResult) {
										if (index === questions[currentQuestionIndex].a) {
											buttonClass += "bg-green-100 border-green-500 text-green-700"
										} else if (index === selectedAnswer) {
											buttonClass += "bg-red-100 border-red-500 text-red-700"
										} else {
											buttonClass += "bg-gray-50 border-gray-200 text-gray-500"
										}
									} else {
										buttonClass += "bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer"
									}

									return (
										<button
											key={index}
											onClick={() => handleAnswer(index)}
											className={buttonClass}
											disabled={showResult}
										>
											<span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
											{showResult && index === questions[currentQuestionIndex].a && <span className="float-right">✓</span>}
											{showResult && index === selectedAnswer && index !== questions[currentQuestionIndex].a && <span className="float-right">✗</span>}
										</button>
									)
								})}
							</div>
						</div>

						{/* Result Feedback */}
						{showResult && (
							<div className={`text-center p-4 rounded-lg ${
								selectedAnswer === questions[currentQuestionIndex].a 
									? 'bg-green-100 text-green-700' 
									: 'bg-red-100 text-red-700'
							}`}>
								<div className="text-2xl mb-2">
									{selectedAnswer === questions[currentQuestionIndex].a ? '🎉 Correct!' : '😔 Incorrect!'}
								</div>
								<p className="text-sm">
									{selectedAnswer === questions[currentQuestionIndex].a 
										? 'Great job! You got it right!' 
										: `The correct answer is: ${questions[currentQuestionIndex].options[questions[currentQuestionIndex].a]}`
									}
								</p>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	)
}

