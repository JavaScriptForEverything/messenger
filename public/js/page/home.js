// import { createPicker } from 'https://unpkg.com/picmo@latest/dist/index.js';
// import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js'
import { createPicker } from '../plugins/picmo/index.js';
// import WaveSurfer from '../plugins/wavesurfer/index.js'
import { $, getReadableFileSizeString } from '../module/utils.js'
import * as wss from '../module/wss.js' 		// ui imported in wss so UI is available too
// import * as store from '../module/store.js' 		
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


// let timer = null
// let controller = null

// const leftFriendPanel = $('[name=left-main]') 	
// const messageContainer = $('[name=message-container]') 	
const microphoneInsideInput = $('form[name=middle-bottom] [for=microphone-icon-button]')
const writeMessageInput = $('[name=write-message-input]') 	
const pickerContainer = $('[name=picker-container]')
const emojiInput = $('#emoji-icon-button') 	
const audio = $('[name=microphone-audio') // required for microphone audio capture

const audioCallButton = $('[name=audio-call-button]') 	
const videoCallButton = $('[name=video-call-button]') 	
const rightSideAudioCallButton = $('[name=right-side] [name=audio-call-button]') 	
const rightSideVideoCallButton = $('[name=right-side] [name=video-call-button]') 	

// attachments buttons
const attachmentsFilterImageButton = $('[name=attachments-container] [name=filter-image]') 	
const attachmentsFilterAudioButton = $('[name=attachments-container] [name=filter-audio]') 	
const attachmentsFilterVideoButton = $('[name=attachments-container] [name=filter-video]') 	
const attachmentsFilterFileButton = $('[name=attachments-container] [name=filter-file]') 	
const attachmentsViewAllButton = $('[name=attachments-container] [name=view-all]') 	

const textMessagesContainer = $('[name=text-message-container]') 	
const videoContainer = $('[name=video-container]') 	
const callPanel = $('[name=call-panel]') 	

const callPanelMicrophoneButton = $('[name=call-panel] [name=microphone-on-off]') 	
const callPanelCameraButton = $('[name=call-panel] [name=camera-on-off]') 	
const callPanelCallButton = $('[name=call-panel] [name=call]') 	
const callPanelScreenShareButton = $('[name=call-panel] [name=flip-camera]') 	
const callPanelRecordingButton = $('[name=call-panel] [name=recording]') 	

const recordingPanel = $('[name=recording-panel]') 	
const recordingPanelPlayPauseButton = $('[name=recording-panel] [name=play-pause]') 	
const recordingPanelStopRecordingButton = $('[name=recording-panel] [name=stop-recording]') 	
// videoContainer.classList.add('active') 

let wssValue = ''

if(wssValue === 'on-success') { 		// on('call-success', {})
	elements.callingDialog({
		title : 'Incomming Audio Call', 			// string
		callSide: 'callee', 									// caller | callee
		error: '', 														// string
		onSuccess : (evt) => {
			evt.target.remove() 								// close dialog
			// console.log(evt.target)
			console.log('you click success')
		},
		onReject : (evt) => {
			evt.target.remove() 								// close dialog
			// console.log(evt.target)
			console.log('you click reject')
		},
		onError : (evt) => {
			setTimeout(() => {
				evt.target.remove()
				wssValue = 'on-error'
			})
		}
	})
}

if(wssValue === 'no-reject') { 		// on('call-error', {})
	elements.callingDialog({
		title : 'Not Found', 									// string
		callSide: 'caller', 									// caller | callee
		error: 'caller may be busy', 					// string
		onError : (evt) => {
			setTimeout(() => {
				evt.target.remove()
			}, 3000)
		}
	})
}



const preCallHandler = () => new Promise((resolve, reject) => { 

	elements.callingDialog({
		title : 'Calling', 										// string
		callSide: 'caller', 									// caller | callee
		error: '', 														// string
		onSuccess : (evt) => {
			evt.target.remove()
			// console.log(evt.target)
			wssValue = 'on-success'
			resolve(true)
		},
		onReject : (evt) => {
			evt.target.remove()
			// console.log(evt.target)
			wssValue = 'on-reject'
			resolve(false)
		},
		onError : (evt) => {
			setTimeout(() => {
				evt.target.remove()
			})
		}
	})
})

// force user to stop audio call if already in video call 
const audioCallHandler = async () => {
	if(videoCallButton.disabled || rightSideVideoCallButton.disabled) {
		ui.showError('Your video call must be terminate first')
		return
	}

	const isPreCallSucceed = await preCallHandler()
	if( !isPreCallSucceed ) return

	audioCallButton.disabled = true
	rightSideAudioCallButton.disabled = true
	closeCallHandler() 																// 1. close previous call style 

	textMessagesContainer.classList.add('hidden') 		// 2. hide chat messages
	videoContainer.classList.add('active') 						// 3. show calling dialog
	callPanel.classList.add('audio') 									// 4. only show 3rd call button, others will be hidden
}
const videoCallHandler = async () => {
	if(audioCallButton.disabled || rightSideAudioCallButton.disabled) {
		ui.showError('Your audio call must be terminate first')
		return
	}

	const isPreCallSucceed = await preCallHandler()
	if( !isPreCallSucceed ) return

	videoCallButton.disabled = true
	rightSideVideoCallButton.disabled = true
	closeCallHandler() 																// 1. close previous call style 

	videoContainer.classList.add('active') 						// 2. show calling dialog
	textMessagesContainer.classList.add('hidden') 		// 3. hide old chat messages
	callPanel.classList.remove('audio') 							// 4. make video call
}
const closeCallHandler = () => {
	console.log('stop call')

	//----------[ if success then reset styles ]----------
	textMessagesContainer.classList.remove('hidden') 	// 1. show old chats after call end
	videoContainer.classList.remove('active') 				// 2. hide video container

	// 3. reset callPanel
	callPanelMicrophoneButton.classList.remove('called') 		// reset microphone  style
	callPanelCameraButton.classList.remove('called') 					// reset camera style
	callPanelScreenShareButton.classList.remove('called') 	// reset screenShare style
	stopRecordingHandler() 	// reset recording
}
const resetCallHandler = () => {
	audioCallButton.disabled = false
	videoCallButton.disabled = false
	rightSideAudioCallButton.disabled = false
	rightSideVideoCallButton.disabled = false
	// 
}

const stopRecordingHandler = () => {
		console.log('stop recording handler')
	
		// handle close functionality
			// 1. stop webRTC call
			// ...

	callPanelRecordingButton.classList.remove('called') 				// 1. reset active recording button style
	recordingPanel.classList.add('hidden') 											// 2. hide recording panel
	recordingPanelPlayPauseButton.classList.add('called') 			// 3. make recording pause state
}



// ----------[ Emoji Picker ]----------
const picker = createPicker({ rootElement: pickerContainer })
picker.addEventListener('emoji:select', (evt) => {
	emojiInput.checked = false
	writeMessageInput.value += evt.emoji
})

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



//----------[ call audio/video ]----------

audioCallButton.addEventListener('click', (evt) => {
	audioCallHandler()
})
videoCallButton.addEventListener('click', (evt) => {
	videoCallHandler()
})
rightSideAudioCallButton.addEventListener('click', (evt) => {
	audioCallHandler()
})
rightSideVideoCallButton.addEventListener('click', (evt) => {
	videoCallHandler()
})


callPanelMicrophoneButton.addEventListener('click', (evt) => {
	if(evt.target.classList.contains('called')) {
		evt.target.classList.remove('called')
	} else {
		evt.target.classList.add('called')
	}
})
callPanelCameraButton.addEventListener('click', (evt) => {
	if(evt.target.classList.contains('called')) {
		evt.target.classList.remove('called')
	} else {
		evt.target.classList.add('called')
	}
})
callPanelCallButton.addEventListener('click', () => {
	closeCallHandler()
	resetCallHandler()
})
callPanelScreenShareButton.addEventListener('click', (evt) => {
	if(evt.target.classList.contains('called')) {
		evt.target.classList.remove('called')
	} else {
		evt.target.classList.add('called')
	}
})
callPanelRecordingButton.addEventListener('click', (evt) => {
	if(evt.target.classList.contains('called')) {
		evt.target.classList.remove('called')
		stopRecordingHandler()

	} else {
		evt.target.classList.add('called') 													// 1. active recording button style
		recordingPanel.classList.remove('hidden') 									// 2.1. To show recording panel remove: hidden
		recordingPanel.classList.add('flex') 												// 2.2. then add flex, [ because that is flex container]
		recordingPanelPlayPauseButton.classList.remove('called') 		// 3. make recording pay state
	}
})

recordingPanelPlayPauseButton.addEventListener('click', (evt) => {
	if(evt.target.classList.contains('called')) {
		evt.target.classList.remove('called')
	} else {
		evt.target.classList.add('called')
	}
})

recordingPanelStopRecordingButton.addEventListener('click', stopRecordingHandler)


// -----





//----------[ Drag-and-Drop File Upload ]----------
const dragAndDropContainer = $('[name=drag-and-drop-container]')
const dropListContainer = $('[name=drop-list-container]')
const dragAndDropFileInput = $('[id=drag-and-drop-file]')
const attachmentInputCheckbox = $('[id=attachment-icon-button]')

const showDragItemsInUI = (fileArray) => {
	// Step-1: show Files in UI
	fileArray.forEach( file => {
		dropListContainer.insertAdjacentElement('beforeend', elements.dropList({
			fileName: file.name,
			fileSize: getReadableFileSizeString(file.size),
		}))
	})

	// Step-2: handle fileUpload here
	ui.showError('file uploads handle via webRTC')


	// Step-3: reset
	setTimeout(() => {
		dropListContainer.innerHTML = '' 						// empty list items
		attachmentInputCheckbox.checked = false 		// hide the 'drag-and-drop-panel'
		
	}, 3000);
}

dragAndDropContainer.addEventListener('dragover', (evt) => {
	evt.preventDefault()
	evt.target.style.borderColor = '#2879e377'
})
dragAndDropContainer.addEventListener('dragleave', (evt) => {
	const rect = evt.target.getBoundingClientRect()
	if(
		evt.clientX > rect.left + rect.width || 
		evt.clientX < rect.left || 
		evt.clientY > rect.top + rect.height || 
		evt.clientY < rect.top
	) {
		evt.target.removeAttribute('style')
	}
})
	
dragAndDropContainer.addEventListener('drop', (evt) => {
	evt.preventDefault()
	evt.target.removeAttribute('style')

	const fileArray = [...evt.dataTransfer.files]
	showDragItemsInUI(fileArray)
})
dragAndDropFileInput.addEventListener('change', (evt) => {
	evt.preventDefault()

	const fileArray = [...evt.target.files]
	showDragItemsInUI(fileArray)
})





//----------[ Right-Side: Attachments filters ]----------
const handleAttachment = (type='text') => () => {
	ui.filterMessageByAttachmentType(type)
}
attachmentsFilterImageButton.addEventListener('click', handleAttachment('image'))
attachmentsFilterAudioButton.addEventListener('click', handleAttachment('audio'))
attachmentsFilterVideoButton.addEventListener('click', handleAttachment('video'))
attachmentsFilterFileButton.addEventListener('click', handleAttachment('file'))
attachmentsViewAllButton.addEventListener('click', (evt) => {
	ui.showError('handle view all ')
	console.log('view all')
})







