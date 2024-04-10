// import { createPicker } from 'https://unpkg.com/picmo@latest/dist/index.js';
// import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js'
import { createPicker } from '../plugins/picmo/index.js';
// import WaveSurfer from '../plugins/wavesurfer/index.js'
import { $, toggleClass } from '../module/utils.js'
import * as wss from '../module/wss.js' 		// ui imported in wss so UI is available too
import * as ui from '../module/ui.js'
import * as recording from '../module/recording.js'
import * as elements from '../module/elements.js'

/*----------[ Note ]----------
	Only handle initial scripts in this file, and all the modification
	in ui.js and
	every service in it's own file.

----------[ Global Variables ]----------
	. io
	. logedInUser
*/

const socket = io('/')
wss.registerSocketEvents(socket) 	// Handling all WebSocket events in wss.js file
// webRTCHandler.getLocalPreview()

// store.setLogedInUser( logedInUser ) 	// logedInUser comes from backend

let timer = null
// let controller = null

// const leftFriendPanel = $('[name=left-main]') 	
// const messageContainer = $('[name=message-container]') 	
const audioCallButton = $('[name=audio-call-button]') 	
const videoCallButton = $('[name=video-call-button]') 	
// const videoContainer = $('[name=video-container]') 	
// const chatsContainer = $('#chats-container')
const microphoneInsideInput = $('form[name=middle-bottom] [for=microphone-icon-button]')
const writeMessageInput = $('[name=write-message-input]') 	
const pickerContainer = $('[name=picker-container]')
const emojiInput = $('#emoji-icon-button') 	
const audio = $('[name=microphone-audio') // required for microphone audio capture

// videoContainer.classList.add('active')

// hide left-panel: for testing
	// $('#left-side-checkbox').checked = false




//----------[ message audio ]----------
microphoneInsideInput.addEventListener('click', async (evt) => {
	const isHasBlinkClass = evt.target.classList.contains('blink')

	if(!isHasBlinkClass) {
		try {
			await recording.startRecording(audio)
			
			evt.target.classList.add('blink')
			writeMessageInput.placeholder = ''
			writeMessageInput.value = '00:00'
			writeMessageInput.readOnly = !isHasBlinkClass  // make input un-editable
			writeMessageInput.style.border = '1px solid #cbd5e1'

		} catch (err) {
			const message = `Microphone Permission: ${err.message}`
			ui.showError(message)
		}


	} else if(isHasBlinkClass) {
		writeMessageInput.removeAttribute('style')
		writeMessageInput.value = ''
		writeMessageInput.placeholder = 'Write Your Message'
		evt.target.classList.remove('blink')
		writeMessageInput.readOnly = false

		recording.stopRecording(audio)
	}

	// toggleClass(evt.target, 'blink') // evt.target.classList.toggle('blink', !evt.target.classList.contains('blink') )
})
// -----

audioCallButton.addEventListener('click', (evt) => {
	toggleClass(evt.target, 'active')
})
videoCallButton.addEventListener('click', (evt) => {
	toggleClass(evt.target, 'active')
})





// elements.createYourAudio(messageContainer, { audioUrl: '/music/ignite.mp3' })

/*
elements.createFirendList(leftFriendPanel, {
	id: 1,
	avatar: '/images/users/default.jpg',
	isActive: true,

	createdAt: Date.now(), 
	notificationValue:  2,
})

elements.createFirendList(leftFriendPanel, {
	id: 2,
	avatar: '/images/users/default.jpg',
	name: 'Fiaz Sofeone Rakib',
	isActive: true,

	message: 'businessman textile',
	type: 'audio',
	createdAt: Date.now(), 

	isMessageSuccess: true,
	isNotification: false,
	isNoNotification: false,
	notificationValue:  2,
})

*/






// const theirWavesurfer = WaveSurfer.create({
// 	container: '[name=their-audio] #waveform',
// 	waveColor: '#7ca4d0aa',
// 	progressColor: '#3b82f6',
// 	url: '/music/ignite.mp3', 			

// 	height: 32,
// 	response: true,
// 	barWidth: 2,
// 	barRadius: 2,
// })
// const yourWavesurfer = WaveSurfer.create({
// 	container: '[name=your-audio] #waveform',
// 	waveColor: '#7ca4d0aa',
// 	progressColor: '#3b82f6',
// 	url: '/music/ignite.mp3', 			

// 	height: 32,
// 	response: true,
// 	barWidth: 2,
// 	barRadius: 2,
// })

// playPauseButton.addEventListener('click', () => {
// 	theirWavesurfer.playPause() 	
// 	yourWavesurfer.playPause() 	
// })
/*
*/

  // "",
  // "6606b8c47844a6763050de3c",
	// "6606f381e629d675c08c85b8",
	// "6606f3a6e629d675c08c85ba"

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








// ----------[ Emoji Picker ]----------
const picker = createPicker({
	rootElement: pickerContainer
})

picker.addEventListener('emoji:select', (evt) => {
	emojiInput.checked = false
	writeMessageInput.value += evt.emoji
})

