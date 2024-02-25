// const avatarEl = $('[name=avatar]')
export const $ = (selector) => document.querySelector( selector )

// redirectTo('/register')
export const redirectTo = (path, { base='' } = {}) => {
	const url = new URL( path, base || location.origin ) 		// get current url
	location.href = url.href 	
}


// it prevent HTML XSS Attack
export const encodeHTML = (string) => string
	.replace(/&/g, '&amp;')
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;')
	.replace(/"/g, '&quot;')
	.replace(/'/g, '&apos;')

export const decodeHTML = (string) => string
	.replace(/&amp;/g, '&')
	.replace(/&lt;/g, '<')
	.replace(/&gt;/g, '>')
	.replace(/&quot;/g, '"')
	.replace(/&apos;/g, "'")


// Convert '<p> hi </p>' 	=> .createElement('p').textContent = 'hi'
export const stringToElement = ( htmlString ) => {
	const parser = new DOMParser()
	const doc = parser.parseFromString( htmlString, 'text/html' )

	return doc.body.firstChild
}


// toggleClass(evt.target, 'active')
export const toggleClass = (selector, className='active') => {
	const { classList } = selector
	classList.toggle(className, !classList.contains(className))
}




/*
const cameraIconButtonInput = $('#camera-icon-button')
cameraIconButtonInput.addEventListener('change', async (evt) => {
	try {
		const dataUrl = await readAsDataURL(evt.target.files[0])
		elements.createYourMessage(messageContainer, { type: 'image', message: dataUrl })
		elements.createTheirMessage(messageContainer, { type: 'image', message: dataUrl })

	} catch (err) {
		console.log(err.message)
	}
}) */
export const readAsDataURL = (file, { type='image' } = {}) => {
	return new Promise((resolve, reject) => {

		if(type === 'image') {
			const isImage = file?.type.match('image/*')
			if(!isImage) return reject(new Error('Please select an image') )
		}

		const reader = new FileReader()
		reader.readAsDataURL(file)
		reader.addEventListener('loadend', () => {
			resolve(reader.result)
		})
	})
}