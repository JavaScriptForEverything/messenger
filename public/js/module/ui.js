import { Snackbar } from './components/index.js'


export const showError = (message, reason) => {
	console.log(message)
	Snackbar({
		severity: 'error',
		message
	})
}
