// import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js'
import WaveSurfer from '../plugins/wavesurfer/index.js'
import { Snackbar } from '../module/components/index.js'
import { $, toggleClass } from '../module/utils.js'
import * as wss from '../module/wss.js'
// import * as store from '../module/store.js'
// import * as webRTCHandler from '../module/webRTCHandler.js'
// import * as constants from '../module/constants.js'
import * as elements from '../module/elements.js'
// import * as recording from '../module/recording.js'

/* only handle eventhandler in this page, don't try to update UI here
		- Because this file run only after every files loaded, that means
			it override others code if tie, so use ui.js to update UI.
*/

const socket = io('/')
wss.registerSocketEvents(socket) 	// Handling all WebSocket events in wss.js file
// webRTCHandler.getLocalPreview()


const leftFriendPanel = $('[name=left-main]') 	
const messageContainer = $('[name=message-container]') 	
const audioCallButton = $('[name=audio-call-button]') 	
const videoCallButton = $('[name=video-call-button]') 	
const videoContainer = $('[name=video-container]') 	
const writeMessageInput = $('[name=write-message-input]') 	

// videoContainer.classList.add('active')


audioCallButton.addEventListener('click', (evt) => {
	toggleClass(evt.target, 'active')

})


videoCallButton.addEventListener('click', (evt) => {
	toggleClass(evt.target, 'active')
})


let timer = null
let controller = null

writeMessageInput.addEventListener('input', async () => {
	clearTimeout(timer)

	timer = setTimeout(async() => {
		if(controller) controller.abort('abort message')

		controller = new AbortController()
		const { signal } = controller

		try {
			const res = await fetch('/api/users', { signal })
			const data = await res.json()
			console.log(data)

		} catch (err) {
			if( err.name === 'AbortError') return

			console.log(err)	
			console.log(signal.reason, signal.aborted)
		}
	}, 1000);
})


elements.createFirendList(leftFriendPanel, {
	avatar: '/images/users/default.jpg',
	isActive: false,

	createdAt: Date.now(), 
	notificationValue:  2,
})

elements.createFirendList(leftFriendPanel, {
	avatar: '/images/users/default.jpg',
	name: 'Fiaz Sofeone Rakib',
	title: 'businessman textile',

	createdAt: Date.now(), 

	isActive: true,
	isMessageSuccess: true,
	isNotification: false,
	isNoNotification: false,
	notificationValue:  2,
})

elements.createFirendList(leftFriendPanel, {
	avatar: '/images/users/default.jpg',
	name: 'Fiaz Sofeone Rakib',
	title: 'businessman textile',

	createdAt: Date.now(), 

	isActive: true,
	isMessageSuccess: true,
	isNotification: true,
	isNoNotification: true,
	notificationValue:  2,
})

/*
const theirWavesurfer = WaveSurfer.create({
	container: '[name=their-audio] #waveform',
	waveColor: '#7ca4d0aa',
	progressColor: '#3b82f6',
	url: '/music/ignite.mp3', 			

	height: 32,
	response: true,
	barWidth: 2,
	barRadius: 2,
})
const yourWavesurfer = WaveSurfer.create({
	container: '[name=your-audio] #waveform',
	waveColor: '#7ca4d0aa',
	progressColor: '#3b82f6',
	url: '/music/ignite.mp3', 			

	height: 32,
	response: true,
	barWidth: 2,
	barRadius: 2,
})

playPauseButton.addEventListener('click', () => {
	theirWavesurfer.playPause() 	
	yourWavesurfer.playPause() 	
})
*/

elements.createTheirMessage(messageContainer, 'hi')
elements.createYourMessage(messageContainer, 'whats up')

// elements.createTheirAudio(messageContainer, { audioUrl: '/music/ignite.mp3' })
// elements.createYourAudio(messageContainer, { audioUrl: '/music/ignite.mp3' })


// elements.callingDialog({
// 	title : 'Incomming Audio Call', 			// string
// 	callSide: 'callee', 									// caller | callee
// 	error: '', 														// string
// 	onSuccess : (evt) => {
// 		evt.target.remove()
// 		console.log(evt.target)
// 	},
// 	onReject : (evt) => {
// 		evt.target.remove()
// 		console.log(evt.target)
// 	},
// 	onError : (evt) => {
// 		setTimeout(() => {
// 			evt.target.remove()
// 		})
// 	}
// })

// elements.callingDialog({
// 	title : 'Calling', 										// string
// 	callSide: 'caller', 									// caller | callee
// 	error: '', 														// string
// 	onSuccess : (evt) => {
// 		evt.target.remove()
// 		console.log(evt.target)
// 	},
// 	onReject : (evt) => {
// 		evt.target.remove()
// 		console.log(evt.target)
// 	},
// 	onError : (evt) => {
// 		setTimeout(() => {
// 			evt.target.remove()
// 		})
// 	}
// })

// elements.callingDialog({
// 	title : 'Not Found', 									// string
// 	callSide: 'caller', 									// caller | callee
// 	error: 'caller may be busy', 					// string
// 	onError : (evt) => {
// 		setTimeout(() => {
// 			evt.target.remove()
// 		}, 3000)
// 	}
// })











