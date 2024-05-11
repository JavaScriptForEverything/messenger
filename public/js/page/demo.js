import * as elements from '../module/elements.js'

const $ = (selector) => document.querySelector(selector)

const messagesContainer = $('[name=demo]')

elements.createTheirMessage(messagesContainer, { 
	type: 'text',
	message: 'my message',
	avatar: '/images/logo.png',
	onClose: ({ target }) => {
		console.log(target)
		target.remove()
	}
})
elements.createTheirMessage(messagesContainer, { 
	type: 'image',
	// message: 'my message',
	message: '/images/logo.png',
	avatar: '/images/logo.png',
	onClose: ({ target }) => {
		console.log(target)
		target.remove()
	}
})
elements.createYourMessage(messagesContainer, { 
	type: 'image',
	message: '/images/logo.png',
	onClose: ({ target }) => {
		console.log(target)
		target.remove()
	}
})


// elements.createTheirAudio(messagesContainer, { 
// 	audioUrl: '/music/ignite.mp3',  
// 	onClose: ({ target }) => {
// 		console.log(target)
// 		target.remove()
// 	}
// })


elements.createYourAudio(messagesContainer, { audioUrl: '/music/ignite.mp3' })
// elements.createYourAudio(messagesContainer, { 
// 	audioUrl: '/music/ignite.mp3',
// 	onClose: ({ target }) => {
// 		console.log(target)
// 		target.remove()
// 	}
// })