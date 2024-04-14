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
		reader.addEventListener('load', () => {
			if(reader.readyState === 2) {
				resolve(reader.result)
			}
		})
		reader.addEventListener('error', reject)
	})
}

// export const blobToBase64 = (blob) => new Promise((resolve, reject) => {
// 	const reader = new FileReader()
// 	reader.readAsDataURL(blob)
// 	reader.addEventListener('load', () => {
// 		if(reader.readyState === 2) {
// 			resolve(reader.result)
// 		}
// 	})
// 	reader.addEventListener('error', reject)
// })


export const calculateAudioCurrentTimeValue = (currentTime) => {
  var current_hour = parseInt(currentTime / (60*60)) % 24,
    current_minute = parseInt(currentTime / 60) % 60,
    current_seconds_long = currentTime % 60,
    current_seconds = current_seconds_long.toFixed(),
    current_time = (current_minute < 10 ? "0" + current_minute : current_minute) + ":" + (current_seconds < 10 ? "0" + current_seconds : current_seconds);

  return current_time;
}

export const calculateAudioTotalTimeValue = (length) => {
  var minutes = Math.floor(length / 60),
    seconds_int = length - minutes * 60,
    seconds_str = seconds_int.toString(),
    seconds = seconds_str.substr(0, 2),
    time = minutes + ':' + seconds

  return time;
}




// followUnfollowButton.addEventListener('click', followFollowingHandler)
export const followFollowingHandler = (evt) => {
	const isActive = evt.target.classList.contains('active')
	const buttonText = isActive ? 'follow' : 'following' 		// handle outside of isActive check 

	console.log('handle follow api request hare')

	if(isActive) {
		evt.target.classList.remove('active')
		evt.target.textContent = buttonText

	} else {
		evt.target.classList.add('active')
		evt.target.textContent = buttonText
	}
}