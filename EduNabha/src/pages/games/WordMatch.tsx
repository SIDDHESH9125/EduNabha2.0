import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface WordPair {
	word: string
	match: string
	category: string
	id: string
}

const WORD_CATEGORIES = {
	animals: [
		{ word: 'Cat', match: '🐱', category: 'Animals', id: '1' },
		{ word: 'Dog', match: '🐶', category: 'Animals', id: '2' },
		{ word: 'Lion', match: '🦁', category: 'Animals', id: '3' },
		{ word: 'Elephant', match: '🐘', category: 'Animals', id: '4' },
		{ word: 'Fish', match: '🐠', category: 'Animals', id: '5' },
		{ word: 'Bird', match: '🐦', category: 'Animals', id: '6' }
	],
	food: [
		{ word: 'Apple', match: '🍎', category: 'Food', id: '7' },
		{ word: 'Pizza', match: '🍕', category: 'Food', id: '8' },
		{ word: 'Banana', match: '🍌', category: 'Food', id: '9' },
		{ word: 'Cake', match: '🎂', category: 'Food', id: '10' },
		{ word: 'Ice Cream', match: '🍦', category: 'Food', id: '11' },
		{ word: 'Burger', match: '🍔', category: 'Food', id: '12' }
	],
	nature: [
		{ word: 'Sun', match: '☀️', category: 'Nature', id: '13' },
		{ word: 'Tree', match: '🌳', category: 'Nature', id: '14' },
		{ word: 'Flower', match: '🌸', category: 'Nature', id: '15' },
		{ word: 'Mountain', match: '⛰️', category: 'Nature', id: '16' },
		{ word: 'Ocean', match: '🌊', category: 'Nature', id: '17' },
		{ word: 'Star', match: '⭐', category: 'Nature', id: '18' }
	]
}

export default function WordMatch() {
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
	const [words, setWords] = useState<WordPair[]>([])
	const [shuffledEmojis, setShuffledEmojis] = useState<WordPair[]>([])
	const [matches, setMatches] = useState<string[]>([])
	const [score, setScore] = useState(0)
	const [selectedWord, setSelectedWord] = useState<string | null>(null)
	const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
	const [incorrectAttempts, setIncorrectAttempts] = useState<string[]>([])
	const [gameCompleted, setGameCompleted] = useState(false)
	const [timeElapsed, setTimeElapsed] = useState(0)
	const [isGameActive, setIsGameActive] = useState(false)

	useEffect(() => {
		let timer: NodeJS.Timeout
		if (isGameActive && !gameCompleted) {
			timer = setInterval(() => setTimeElapsed(prev => prev + 1), 1000)
		}
		return () => clearInterval(timer)
	}, [isGameActive, gameCompleted])

	useEffect(() => {
		if (matches.length === words.length && words.length > 0) {
			setGameCompleted(true)
			setIsGameActive(false)
		}
	}, [matches.length, words.length])

	function startGame(category: string) {
		const categoryWords = WORD_CATEGORIES[category as keyof typeof WORD_CATEGORIES]
		setWords(categoryWords)
		setShuffledEmojis([...categoryWords].sort(() => Math.random() - 0.5))
		setSelectedCategory(category)
		setMatches([])
		setScore(0)
		setIncorrectAttempts([])
		setGameCompleted(false)
		setTimeElapsed(0)
		setIsGameActive(true)
		setSelectedWord(null)
		setSelectedEmoji(null)
	}

	function selectWord(wordId: string) {
		if (matches.includes(wordId)) return
		setSelectedWord(selectedWord === wordId ? null : wordId)
		setSelectedEmoji(null)
	}

	function selectEmoji(emojiId: string) {
		if (matches.includes(emojiId)) return
		setSelectedEmoji(selectedEmoji === emojiId ? null : emojiId)
		setSelectedWord(null)
	}

	function tryMatch() {
		if (!selectedWord && !selectedEmoji) return
		
		const wordItem = words.find(w => w.id === selectedWord)
		const emojiItem = shuffledEmojis.find(e => e.id === selectedEmoji)
		
		if (wordItem && emojiItem && wordItem.id === emojiItem.id) {
			// Correct match!
			setMatches(prev => [...prev, wordItem.id])
			setScore(prev => prev + 1)
			setSelectedWord(null)
			setSelectedEmoji(null)
			
			// Remove from incorrect attempts if it was there
			setIncorrectAttempts(prev => prev.filter(id => id !== wordItem.id))
		} else if (wordItem || emojiItem) {
			// Incorrect match
			const itemId = wordItem?.id || emojiItem?.id
			if (itemId && !incorrectAttempts.includes(itemId)) {
				setIncorrectAttempts(prev => [...prev, itemId])
				setTimeout(() => {
					setIncorrectAttempts(prev => prev.filter(id => id !== itemId))
				}, 1000)
			}
			setSelectedWord(null)
			setSelectedEmoji(null)
		}
	}

	function resetGame() {
		setSelectedCategory(null)
		setWords([])
		setShuffledEmojis([])
		setMatches([])
		setScore(0)
		setSelectedWord(null)
		setSelectedEmoji(null)
		setIncorrectAttempts([])
		setGameCompleted(false)
		setTimeElapsed(0)
		setIsGameActive(false)
	}

	function formatTime(seconds: number) {
		const mins = Math.floor(seconds / 60)
		const secs = seconds % 60
		return `${mins}:${secs.toString().padStart(2, '0')}`
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 p-4">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<Link to="/student" className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 mb-4">
						← Back to Dashboard
					</Link>
					<h1 className="text-4xl font-bold text-gray-800 mb-2">🎯 Word Match Game</h1>
					<p className="text-gray-600">Match words with their corresponding emojis!</p>
				</div>

				{!selectedCategory ? (
					/* Category Selection */
					<div className="grid md:grid-cols-3 gap-6">
						{Object.entries(WORD_CATEGORIES).map(([key, wordList]) => (
							<div key={key} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => startGame(key)}>
								<div className="text-center">
									<div className="text-4xl mb-4">
										{key === 'animals' ? '🐶' : key === 'food' ? '🍎' : '🌳'}
									</div>
									<h3 className="text-xl font-semibold mb-2 capitalize">{key === 'animals' ? 'Animals' : key === 'food' ? 'Food' : 'Nature'}</h3>
									<p className="text-gray-600 mb-4">{wordList.length} pairs to match</p>
									<div className="bg-pink-100 text-pink-700 px-4 py-2 rounded-lg text-sm font-medium">
										Click to Play
									</div>
								</div>
							</div>
						))}
					</div>
				) : gameCompleted ? (
					/* Game Completed */
					<div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-2xl mx-auto">
						<div className="text-6xl mb-4">🎆</div>
						<h2 className="text-3xl font-bold mb-4">Congratulations!</h2>
						<div className="text-4xl font-bold text-pink-600 mb-2">{score}/{words.length}</div>
						<p className="text-gray-600 mb-4">Perfect matches! Time: {formatTime(timeElapsed)}</p>
						<div className="bg-green-100 text-green-700 px-6 py-3 rounded-lg mb-6">
							🏆 Excellent work! You matched all the pairs correctly!
						</div>
						<div className="flex gap-4 justify-center">
							<button 
								onClick={() => startGame(selectedCategory!)}
								className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
							>
								🔄 Play Again
							</button>
							<button 
								onClick={resetGame}
								className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
							>
								🎯 Choose Category
							</button>
						</div>
					</div>
				) : (
					/* Game Play */
					<div className="space-y-6">
						{/* Game Stats */}
						<div className="bg-white rounded-xl shadow-sm p-4">
							<div className="flex justify-between items-center">
								<div className="text-sm text-gray-600">Category: <span className="font-medium capitalize">{selectedCategory}</span></div>
								<div className="text-sm text-gray-600">Score: <span className="font-bold text-pink-600">{score}/{words.length}</span></div>
								<div className="text-sm text-gray-600">Time: <span className="font-medium">{formatTime(timeElapsed)}</span></div>
							</div>
							<div className="mt-3">
								<div className="w-full bg-gray-200 rounded-full h-2">
									<div 
										className="bg-pink-600 h-2 rounded-full transition-all duration-300"
										style={{ width: `${(matches.length / words.length) * 100}%` }}
									></div>
								</div>
							</div>
						</div>

						{/* Instructions */}
						<div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
							<p className="text-blue-700">
								💡 <strong>How to play:</strong> Click on a word, then click on its matching emoji. 
								{(selectedWord || selectedEmoji) && <span className="font-medium">Now click the "Match!" button to confirm.</span>}
							</p>
						</div>

						{/* Game Grid */}
						<div className="grid lg:grid-cols-3 gap-6">
							{/* Words Column */}
							<div className="bg-white rounded-xl shadow-sm p-6">
								<h2 className="text-lg font-semibold mb-4 text-center">📝 Words</h2>
								<div className="space-y-3">
									{words.map((word) => {
										const isMatched = matches.includes(word.id)
										const isSelected = selectedWord === word.id
										const isIncorrect = incorrectAttempts.includes(word.id)
										
										let buttonClass = "w-full p-4 rounded-lg border-2 transition-all duration-200 "
										if (isMatched) {
											buttonClass += "bg-green-100 border-green-400 text-green-700 cursor-default"
										} else if (isSelected) {
											buttonClass += "bg-pink-100 border-pink-400 text-pink-700"
										} else if (isIncorrect) {
											buttonClass += "bg-red-100 border-red-400 text-red-700 animate-pulse"
										} else {
											buttonClass += "bg-white border-gray-200 hover:border-pink-300 hover:bg-pink-50 cursor-pointer"
										}
										
										return (
											<button
												key={word.id}
												onClick={() => selectWord(word.id)}
												className={buttonClass}
												disabled={isMatched}
											>
												<span className="font-medium">{word.word}</span>
												{isMatched && <span className="float-right">✓</span>}
											</button>
										)
									})}
								</div>
							</div>

							{/* Match Button Column */}
							<div className="flex items-center justify-center">
								<div className="bg-white rounded-xl shadow-sm p-6 w-full max-w-xs">
									<div className="text-center">
										<div className="text-2xl mb-4">🔗</div>
										{(selectedWord || selectedEmoji) ? (
											<div>
												<p className="text-sm text-gray-600 mb-3">
													{selectedWord ? 'Word selected!' : 'Emoji selected!'}<br/>
													Now select the {selectedWord ? 'matching emoji' : 'matching word'}
												</p>
												<button 
													onClick={tryMatch}
													className={`px-6 py-3 rounded-lg font-medium transition-colors ${
														(selectedWord && selectedEmoji) 
															? 'bg-green-600 text-white hover:bg-green-700' 
															: 'bg-gray-300 text-gray-500 cursor-not-allowed'
													}`}
													disabled={!(selectedWord && selectedEmoji)}
												>
													✨ Match!
												</button>
											</div>
										) : (
											<p className="text-sm text-gray-500">Select a word and an emoji to match them!</p>
										)}
									</div>
								</div>
							</div>

							{/* Emojis Column */}
							<div className="bg-white rounded-xl shadow-sm p-6">
								<h2 className="text-lg font-semibold mb-4 text-center">😀 Emojis</h2>
								<div className="space-y-3">
									{shuffledEmojis.map((emoji) => {
										const isMatched = matches.includes(emoji.id)
										const isSelected = selectedEmoji === emoji.id
										const isIncorrect = incorrectAttempts.includes(emoji.id)
										
										let buttonClass = "w-full p-4 rounded-lg border-2 transition-all duration-200 "
										if (isMatched) {
											buttonClass += "bg-green-100 border-green-400 text-green-700 cursor-default"
										} else if (isSelected) {
											buttonClass += "bg-pink-100 border-pink-400 text-pink-700"
										} else if (isIncorrect) {
											buttonClass += "bg-red-100 border-red-400 text-red-700 animate-pulse"
										} else {
											buttonClass += "bg-white border-gray-200 hover:border-pink-300 hover:bg-pink-50 cursor-pointer"
										}
										
										return (
											<button
												key={emoji.id}
												onClick={() => selectEmoji(emoji.id)}
												className={buttonClass}
												disabled={isMatched}
											>
												<span className="text-3xl">{emoji.match}</span>
												{isMatched && <span className="float-right text-lg">✓</span>}
											</button>
										)
									})}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

