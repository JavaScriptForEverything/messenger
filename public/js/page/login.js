import { $, redirectTo } from '../module/utils.js'

const loginForm = $('[name=login-form]')

const errorSmall = $('[name=file-container] [name=error-message]')
const inputElements = document.querySelectorAll('[name=field-container] input')


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
		if(status === 'success') redirectTo('/')

	} catch (err) {
		console.log(err)		
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