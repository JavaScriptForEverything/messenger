// import { createPicker } from 'https://unpkg.com/picmo@latest/dist/index.js';
// import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js'
import { createPicker } from '../plugins/picmo/index.js';
// import WaveSurfer from '../plugins/wavesurfer/index.js'
import { $, getReadableFileSizeString } from '../module/utils.js'
import * as wss from '../module/wss.js' 		// ui imported in wss so UI is available too
import * as ui from '../module/ui.js'
import * as recording from '../module/recording.js'
import * as elements from '../module/elements.js'
import * as webRTC from '../module/webRTC.js'

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


const callPanelMicrophoneButton = $('[name=call-panel] [name=microphone-on-off]') 	
const callPanelCameraButton = $('[name=call-panel] [name=camera-on-off]') 	
const callPanelCallButton = $('[name=call-panel] [name=call]') 	
const callPanelScreenShareButton = $('[name=call-panel] [name=flip-camera]') 	
const callPanelRecordingButton = $('[name=call-panel] [name=recording]') 	

const recordingPanel = $('[name=recording-panel]') 	
const recordingPanelPlayPauseButton = $('[name=recording-panel] [name=play-pause]') 	
const recordingPanelStopRecordingButton = $('[name=recording-panel] [name=stop-recording]') 	


/* Toggle video-container
		. if message-container has class 'call' then it shows video-container else hide video-container
*/ 



/* To show message panel in right side: in Desktop-View
*/





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
	ui.audioCallHandler()
})
videoCallButton.addEventListener('click', (evt) => {
	ui.videoCallHandler()
})
rightSideAudioCallButton.addEventListener('click', (evt) => {
	ui.audioCallHandler()
})
rightSideVideoCallButton.addEventListener('click', (evt) => {
	ui.videoCallHandler()
})


callPanelMicrophoneButton.addEventListener('click', (evt) => {
	// console.log('microphone')

	if(evt.target.classList.contains('called')) {
		evt.target.classList.remove('called')
		webRTC.toggleMute(true)
	} else {
		evt.target.classList.add('called')
		webRTC.toggleMute(false)
	}
})
callPanelCameraButton.addEventListener('click', (evt) => {
	if(evt.target.classList.contains('called')) {
		evt.target.classList.remove('called')
		webRTC.toggleCamera(true)
	} else {
		evt.target.classList.add('called')
		webRTC.toggleCamera(false)
	}
})
callPanelCallButton.addEventListener('click', () => {
	ui.closeCallHandler()
})
callPanelScreenShareButton.addEventListener('click', (evt) => {
	console.log('screenShare')
	if(evt.target.classList.contains('called')) {
		evt.target.classList.remove('called')
		webRTC.turnOffScreenShare()
	} else {
		evt.target.classList.add('called')
		webRTC.turnOnScreenShare()
	}
})
callPanelRecordingButton.addEventListener('click', (evt) => {
	console.log('recording')

	if(evt.target.classList.contains('called')) {
		evt.target.classList.remove('called')
		ui.stopRecordingHandler()

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

recordingPanelStopRecordingButton.addEventListener('click', ui.stopRecordingHandler)


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







