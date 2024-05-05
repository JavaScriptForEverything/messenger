import { $, readAsDataURL, redirectTo, showError, showSuccess } from '../module/utils.js'

const registerForm = $('[name=register-form]')

const avatarContainer = $('[name=avatar-container]')
const avatarImg = $('[name=avatar-img]')
const avatarInput = $('[name=avatar]')
const errorSmall = $('[name=file-container] [name=error-message]')
const inputElements = document.querySelectorAll('[name=field-container] input')
const registerButton = $('[name=register]')


// clear form on page load
// registerForm.reset()

// Reset file input on image click
avatarContainer.addEventListener('click', (evt) => {
	avatarImg.src = '/images/users/default.jpg'
	avatarInput.value = ''
})


avatarInput.addEventListener('change', async (evt) => {
	errorSmall.hidden = true
	errorSmall.textContent = ''

	const maxSize = 1*1024*1024
	const file = evt.target.files[0]
	if(file.size > maxSize) return showError('please add file bellow 1 MB')

	try {
		const dataUrl = await readAsDataURL(file)
		avatarImg.src = dataUrl

	} catch (err) {
		console.log(err.message)		
		errorSmall.hidden = false
		errorSmall.textContent = err.message
	}
})


Array.from( inputElements ).forEach( el => {
	el.addEventListener('input', (evt) => {
		validateForm()
	})
})

registerForm.addEventListener('submit', async (evt) => {
	evt.preventDefault()

	const hasError = validateForm()
	if( hasError ) return 

	const formData = new FormData(evt.target)
	const fields = Object.fromEntries( formData )

	fields.avatar = avatarImg.src.startsWith('data:image') ? avatarImg.src : ''
	registerButton.disabled = true


	try {
		const res = await fetch('/api/auth/register', {
			method: 'POST',
			body: JSON.stringify( fields ),
			headers: {
				'content-type': 'application/json'
			}
		})

		// throw error
		if(!res.ok) throw await res.json()
		const { data } = await res.json()

		registerButton.disabled = false
		showSuccess('Registation is successfull')
		
		setTimeout(() => {
			redirectTo('/login')
		}, 2000);

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
		const passwordInput = $('[name=password]')

		// Step-1: check empty field
		if( !el.value.trim() ) {
			if(el.name === 'avatar') return
			errorEl.classList.remove('hidden') 	// show the error element
			errorEl.textContent = `[${el.name}]: field is empty`
			hasError = true
			return
		}

		// Step-2: check name length
		if( (el.name === 'firstName' || el.name === 'lastName') && el.value.length <= 2) {
			errorEl.classList.remove('hidden') 	// show the error element
			errorEl.textContent = `[${el.name}]: is too short`
			hasError = true
			return
		}

		// Step-3: check password length
		if(el.name === 'password' && el.value.length < 8) {
			errorEl.classList.remove('hidden') 	// show the error element
			errorEl.textContent = `[${el.name}]: password is too short`
			hasError = true
			return
		}

		// Step-4: check confirmPassword match
		if(el.name === 'confirmPassword' && el.value !== passwordInput.value) {
			errorEl.classList.remove('hidden') 	// show the error element
			errorEl.textContent = `[${el.name}]: password not matched`
			hasError = true
			return
		}

		errorEl.classList.add('hidden') // hide the error element
	})

	return hasError
}
