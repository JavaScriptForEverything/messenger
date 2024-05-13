import { $, redirectTo, showError } from '../module/utils.js'

const loginForm = $('[name=login-form]')

const errorSmall = $('[name=file-container] [name=error-message]')
const inputElements = document.querySelectorAll('[name=field-container] input')
const loginButton = $('[name=login]')


// clear form on page load
// loginForm.reset()



Array.from( inputElements ).forEach( el => {
	el.addEventListener('input', (evt) => {
		validateForm()
	})
})

loginForm.addEventListener('submit', async (evt) => {
	evt.preventDefault()

	const hasError = validateForm()
	if( hasError ) return 

	const formData = new FormData(evt.target)
	const fields = Object.fromEntries( formData )

	console.log('login')
	loginButton.disabled = true


	try {
		const res = await fetch('/api/auth/login', {
			method: 'POST',
			body: JSON.stringify(fields),
			headers: {
				'content-type': 'application/json'
			}
		})

		if(!res.ok) throw await res.json()

		const { status, data } = await res.json()
		// console.log(data)
		loginButton.disabled = false
		if(status === 'success') redirectTo('/')

	} catch (err) {
		loginButton.disabled = false 		// remove loading

		const form = evt.target
		const emailHelperText = form.querySelector('[name=email] > [name=error-message]')
		const passwordHelperText = form.querySelector('[name=password] > [name=error-message]')

		// passwordHelperText.classList.add('hidden') 	// reset to default
		// emailHelperText.classList.add('hidden') 		// reset to default

		const errorElements = form.querySelectorAll('[name=error-message]')
		errorElements.forEach( errorEl => {
			errorEl.classList.add('hidden') // reset every error-message
		})

		if(err.message.includes('password')) {
			passwordHelperText.textContent = 'password is incorrect'
			passwordHelperText.classList.remove('hidden')
			return
		}
		if(err.message.includes('email')) {
			emailHelperText.textContent = err.message
			emailHelperText.classList.remove('hidden')
			return
		}

		showError(err.message)
	}
})

const validateForm = () => {
	let hasError = false

	Array.from( inputElements ).forEach( el => {
		// console.log({ name: el.name, value: el.value } )

		const parentEl = el.closest('[name=field-container]')
		const errorEl = parentEl.querySelector('[name=error-message]')

		// Step-1: check empty field
		if( !el.value.trim() ) {
			if(el.name === 'avatar') return
			errorEl.classList.remove('hidden') 	// show the error element
			errorEl.textContent = `[${el.name}]: field is empty`
			hasError = true
			return
		}

		errorEl.classList.add('hidden') // hide the error element
	})

	return hasError
}