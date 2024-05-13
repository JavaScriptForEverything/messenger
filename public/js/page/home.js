// import { createPicker } from 'https://unpkg.com/picmo@latest/dist/index.js';
// import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js'
import { createPicker } from '../plugins/picmo/index.js';
import { $, getReadableFileSizeString, showError } from '../module/utils.js'
import * as wss from '../module/wss.js' 		// ui imported in wss so UI is available too
import * as ui from '../module/ui.js'
import * as recording from '../module/recording.js'
import * as elements from '../module/elements.js'
import * as store from '../module/store.js'
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
const microphoneAudio = $('[name=microphone-audio') // required for microphone audio capture

const audioCallButton = $('[name=audio-call-button]') 	
const videoCallButton = $('[name=video-call-button]') 	
const rightSideAudioCallButton = $('[name=right-side] [name=audio-call-button]') 	
const rightSideVideoCallButton = $('[name=right-side] [name=video-call-button]') 	

// attachments buttons
const attachmentsButtonsContainer = $('[name=attachments-buttons-container]')
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

const dragAndDropPanel = $('[name=drag-and-drop-panel]')
const dragAndDropContainer = $('[name=drag-and-drop-container]')
const dropListContainer = $('[name=drop-list-container]')
const dragAndDropFileInput = $('[id=drag-and-drop-file]')
const attachmentInputCheckbox = $('[id=attachment-icon-button]')


// // by default hide file sharing dialog on page load
// attachmentInputCheckbox.checked = false



/* Toggle video-container
		. if message-container has class 'call' then it shows video-container else hide video-container
*/ 



/* To show message panel in right side: in Desktop-View
*/





//----------[ message audio ]----------
const sendMessageRightSideIconsContainer = $('[name=message-icons-container]')

microphoneInsideInput.addEventListener('click', async (evt) => {
	const isHasBlinkClass = evt.target.classList.contains('blink')

	if(!isHasBlinkClass) {
		try {
			await recording.startRecording(microphoneAudio)
			
			evt.target.classList.add('blink')
			writeMessageInput.placeholder = ''
			writeMessageInput.value = '00:00'
			writeMessageInput.readOnly = !isHasBlinkClass  // make input un-editable
			writeMessageInput.style.border = '1px solid #cbd5e1'

			sendMessageRightSideIconsContainer.classList.add('hidden')

		} catch (err) {
			const message = `Microphone Permission: ${err.message}`
			showError(message)
		}


	} else if(isHasBlinkClass) { 			// reset to default UI
		writeMessageInput.removeAttribute('style')
		writeMessageInput.value = ''
		writeMessageInput.placeholder = 'Write Your Message'
		evt.target.classList.remove('blink')
		writeMessageInput.readOnly = false

		sendMessageRightSideIconsContainer.classList.remove('hidden')

		recording.stopRecording(microphoneAudio)
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
	// console.log('recording')

	if(evt.target.classList.contains('called')) {
		ui.stopCallRecordingHandler() 															// if failed, then will not remove called class
		evt.target.classList.remove('called')

	} else {
		ui.startCallRecording()

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

recordingPanelStopRecordingButton.addEventListener('click', ui.stopCallRecordingHandler)


// -----





//----------[ Drag-and-Drop File Upload ]----------
/* if drag-and-dro-panel have .disabled class then don't allow upload
**	1. disable file browser by css: pointer-events-none  or by html/js: disabled=true attribute
**	2. disable drag-and-drop by return false from drop event handler.
**	3. change corsor style show that visual effect of allowed/not-allowed
*/

// // --- testing: trying add download progress-bar
// attachmentInputCheckbox.checked = true
// dragAndDropPanel.classList.remove('disabled')

// const dropList = elements.dropList({
// 	fileName: 'name.txt',
// 	fileSize: getReadableFileSizeString(4987293),
// })
// dropListContainer.insertAdjacentElement('beforeend', dropList)

// 	console.log(dropList)
// 	console.log(dropList.name)
// 	console.log(dropList.class)
// 	setTimeout(() => {
// 		console.log(dropList.classList.contains('active'))
// 	}, 2000);

// let timer = 0
// setInterval(() => {
// 	// if( true ) clearInterval(timer)
// 	// const { donwnloadedFileSize, isDownloading } = store.getState()
// 	// console.log({ donwnloadedFileSize, isDownloading })
// 	console.log(
// 		dropList.classList
// 	)
// }, 1000);

// const showDragItemsInUI = (fileArray) => {
// 	fileArray.forEach( async (file) => {

// 		const maxFileSize = 2*1024*1024*1024 		// => 2 GB
// 		if(file.size > maxFileSize) {
// 			showError('max file-size: 2 GB')
// 			// return
// 		} 

// 		const dropList = elements.dropList({
// 			fileName: file.name,
// 			fileSize: getReadableFileSizeString(file.size),
// 		})
// 		dropListContainer.insertAdjacentElement('beforeend', dropList)

// 		let downloadedSize = 0

// 		try {
// 			const stream = file.stream()
// 			const reader = stream.getReader()

// 			const handleReading = (done, value) => {
// 				if(done) {
// 					// webRTC.sendFileByDataChannel(JSON.stringify({ done: true, name: file.name, type: file.type }))
// 					ui.removeDragAndDropDownloadingIndicator()


// 					setTimeout(() => {
// 						store.setDownloadedFileSize(downloadedSize)
// 						// store.setIsDownloading(false)
// 					}, 1000);

// 					console.log({ downloadedSize, totalSize: file.size })

// 					return
// 				}

// 				downloadedSize += value.length
// 				store.setDownloadedFileSize(downloadedSize)
// 				console.log({ downloadedSize })

// 				// webRTC.sendFileByDataChannel(value) 			// send arrayBuffer of stream
// 				ui.addDragAndDropDownloadingIndicator() 	// 

// 				reader.read().then( ({ done, value }) => {
// 					handleReading(done, value)
// 				})
// 			}

// 			reader.read().then( ({ done, value }) => {
// 				handleReading(done, value)
// 			})




// 		} catch (err) {
// 			console.log('file.arrayBuffer() failed')	
// 		}
// 	})
// }
// // --- end testing

const showDragItemsInUI = (fileArray) => {
	fileArray.forEach( async (file) => {

		const maxFileSize = 2*1024*1024*1024 		// => 2 GB
		if(file.size > maxFileSize) {
			showError('max file-size: 2 GB')
			return
		} 

		const element = elements.dropList({
			fileName: file.name,
			fileSize: getReadableFileSizeString(file.size),
		})
		dropListContainer.insertAdjacentElement('beforeend', element)

		const progressEl = element.querySelector('[name=progress-meter]')
		const progressValueSpan = element.querySelector('[name=progress-value]')
		const closeButton = element.querySelector('[name=success-close-button]')
		const totalSize = file.size
		let progressValue = 0

		const downloadFinished = () => element.classList.add('done') 
		const increaseProgressValue = (parcentage) => {
			progressEl.value = parcentage
			progressValueSpan.textContent = `${parcentage.toFixed()}/%`
			progressEl.classList.toggle('active', parcentage >= 50)
		}

		closeButton.addEventListener('click', (evt) => {
			if( element.classList.contains('done') ) {
				// console.log('done button')
				element.remove()
			} else {
				// console.log('close button')
				element.remove()
			}
		})


		try {
			const stream = file.stream()
			const reader = stream.getReader()

			// WebRTC-Step-1: send start indication: send totalSize to show progress bar on callee-side too
			webRTC.sendFileByDataChannel(JSON.stringify({ 
				start: true, 
				// name: file.name, 
				// type: file.type,
				size: file.size,
			}))

			const handleReading = (done, value) => {
				if(done) {
					// WebRTC-Step-3: send finished indication
					webRTC.sendFileByDataChannel(JSON.stringify({ 
						done: true, 
						name: file.name, 
						// type: file.type 
					}))
					ui.removeDragAndDropUploadingIndicator()
					downloadFinished()
					return
				}

				reader.read().then( ({ done, value }) => {
					handleReading(done, value)
				})

				// WebRTC-Step-3: send chunks as Blob
				webRTC.sendFileByDataChannel(value) 			// send arrayBuffer of stream
				ui.addDragAndDropUploadingIndicator()


				const parcentage = (progressValue / totalSize ) * 100
				increaseProgressValue(parcentage)

				// NB: sender-side: need to send parcentage value later, else shows wrong parcentageValue
				progressValue += value.length 						// NB: this value is chunk of string
			}

			reader.read().then( ({ done, value }) => {
				handleReading(done, value)
			})


			// dropListContainer.insertAdjacentElement('beforeend', elements.dropList({
			// 	fileName: file.name,
			// 	fileSize: getReadableFileSizeString(file.size),
			// }))

		} catch (err) {
			console.log('file.arrayBuffer() failed')	
		}
	})
}

dragAndDropContainer.addEventListener('dragover', (evt) => {
	evt.preventDefault()

	// 2. disable drag-and-drop by return false from drop event handler.
	if( dragAndDropPanel.classList.contains('disabled') ) {
		evt.dataTransfer.dropEffect = 'none'
		return false
	}

	evt.target.style.borderColor = '#2879e377'
	evt.dataTransfer.dropEffect = "copy";
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

	// 2. disable drag-and-drop by return false from drop event handler.
	if( dragAndDropPanel.classList.contains('disabled') ) {
		return false
	}

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
	showError('handle view all ')
	// console.log('view all')
})


const attachmentsButtons = Array.from( attachmentsButtonsContainer.children )
attachmentsButtonsContainer.addEventListener( 'click', (evt) => {
	if(evt.target.tagName !== 'BUTTON') return

	attachmentsButtons.forEach( button => {
		button.classList.toggle('active', button.name === evt.target.name)
	})
})







// ----------[ Emoji Picker ]----------
// add picker very end if no internet then don't slow down the app
const picker = createPicker({ rootElement: pickerContainer })
picker.addEventListener('emoji:select', (evt) => {
	emojiInput.checked = false
	writeMessageInput.value += evt.emoji
})
