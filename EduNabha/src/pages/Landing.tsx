import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function Landing() {
	const { t, i18n } = useTranslation()
	const samples = [
		{ title: 'Mathematics - Fractions', to: '/student' },
		{ title: 'Science - Plants', to: '/student' },
		{ title: 'Punjabi - Reading', to: '/student' },
	]
	return (
		<div className="max-w-3xl mx-auto p-6">
			<header className="flex items-center justify-between mb-8">
				<h1 className="text-2xl font-semibold text-sky-700">{t('appName')}</h1>
				<select
					className="border rounded px-2 py-1"
					value={i18n.language}
					onChange={(e) => i18n.changeLanguage(e.target.value)}
				>
					<option value="en">English</option>
					<option value="hi">हिन्दी</option>
					<option value="pa">ਪੰਜਾਬੀ</option>
				</select>
			</header>
			<div className="grid gap-4 md:grid-cols-3">
				<div className="card">
					<h2 className="font-medium mb-2">{t('student')}</h2>
					<Link to="/login?role=student" className="btn w-full">{t('login')}</Link>
					<div className="text-sm mt-2">
						<Link to="/signup?role=student" className="text-sky-700">{t('signup')}</Link>
					</div>
				</div>
				<div className="card">
					<h2 className="font-medium mb-2">{t('teacher')}</h2>
					<Link to="/login?role=teacher" className="btn w-full">{t('login')}</Link>
					<div className="text-sm mt-2">
						<Link to="/signup?role=teacher" className="text-sky-700">{t('signup')}</Link>
					</div>
				</div>
				<div className="card">
					<h2 className="font-medium mb-2">{t('parent')}</h2>
					<Link to="/login?role=parent" className="btn w-full">{t('login')}</Link>
					<div className="text-sm mt-2">
						<Link to="/signup?role=parent" className="text-sky-700">{t('signup')}</Link>
					</div>
				</div>
			</div>
			<section className="mt-6 card">
				<h3 className="font-medium mb-2">Sample Courses</h3>
				<ul className="list-disc ml-6 text-sm space-y-1">
					{samples.map((s, i) => (
						<li key={i}><Link className="text-sky-700" to={s.to}>{s.title}</Link></li>
					))}
				</ul>
			</section>
		</div>
	)
}
