import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
	en: {
		translation: {
			appName: 'EduNabha',
			login: 'Login',
			signup: 'Sign up',
			student: 'Student',
			teacher: 'Teacher',
			parent: 'Parent',
		}
	},
	hi: {
		translation: {
			appName: 'एडुनाभा',
			login: 'लॉगिन',
			signup: 'साइन अप',
			student: 'छात्र',
			teacher: 'अध्यापक',
			parent: 'अभिभावक',
		}
	},
	pa: {
		translation: {
			appName: 'ਏਡੂਨਾਭਾ',
			login: 'ਲਾਗਇਨ',
			signup: 'ਸਾਇਨ ਅੱਪ',
			student: 'ਵਿਦਿਆਰਥੀ',
			teacher: 'ਅਧਿਆਪਕ',
			parent: 'ਮਾਪੇ',
		}
	}
}

i18n.use(initReactI18next).init({
	resources,
	lng: 'en',
	fallbackLng: 'en',
	interpolation: { escapeValue: false },
})

export default i18n
