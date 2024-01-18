import { $ } from './utils.js'
import * as constants from './constants.js'
import * as home from '../page/home.js'
import * as store from './store.js'


/* Don't modify ui in home.js instead use ui.js
		- Because home.js runs after all scripts because we attach as <script defer ...>
			which run after every files. that means it has HIGHER PRIORITY than others.

			so modify UI in ui.js file instead of home.js file or write code carefully which code overriden by home.js

 	How this page loaded or executed ?
		- We import 
				home.pug 	=>  home.js
				wss.js 		=>  home.js
				ui.js 		=>  wss.js

				=> so home.js has access ui.js too
*/


const incommingCallingDialog = $('[name=incomming-call-dialog]')
const outgoingCallDialog = $('[name=outgoing-call-dialog]')
const errorCallDialog = $('[name=error-call-dialog]')

const personalVideoCallButton = $('[name=personal-video-call-button]')
const callInputCheckbox = $('#call-button')
const remoteVideo = $('video[name=remote-video]')
const leftPanelToggleInput = $('#toggle-left-panel')
const typingIndicator = $('[name=typing-indicator]')

callInputCheckbox.checked = false
personalVideoCallButton.disabled = true



export const toggleLeftPanel = (isShown = false) => {
	leftPanelToggleInput.checked = isShown
}
toggleLeftPanel(true) 									// show left panel in the begining


export const toggleVideoCallButton = (isEnabled = false) => {
	personalVideoCallButton.disabled = !isEnabled
}


let timer = 0
export const toggleTypingIndicator = (isVisible = false) => {
	typingIndicator.style.display = isVisible ? 'block' : 'none'
	clearTimeout(timer)

	timer = setTimeout(() => {
		toggleTypingIndicator(false)			// hide
		// typingIndicator.style.display = !isVisible ? 'block' : 'none'
	}, 3000);
}



export const updatePersonalCode = (socketId) => {
	$('[name=show-socket-id]').textContent = socketId
}

// callee side
export const showIncommingCallDialog = (callType, acceptCallHandler, rejectCallHandler) => {
	const exactCallType = callType === constants.callType.PERSONAL_CHAT_CODE ? 'Chat' : 'Video'
	// const incommingCallDialog = elements.getIncommingCallDialog(exactCallType, acceptCallHandler, rejectCallHandler)

	// const incommingCallingDialog = $('[name=incomming-call-dialog]')
	const dialogTitle = $('[name=incomming-call-dialog] [name=dialog-title]')
	const acceptCallButton = $('[name=incomming-call-dialog] [name=call-in-button]')
	const rejectCallButton = $('[name=incomming-call-dialog] [name=call-off-button]')

	dialogTitle.textContent = `incomming ${exactCallType} call`
	incommingCallingDialog.style.display = 'flex'

	acceptCallButton.addEventListener('click', (evt) => {
		closeIncommingCallDialog()
		acceptCallHandler(callType)
	})
	rejectCallButton.addEventListener('click', (evt) => {
		closeIncommingCallDialog()
		rejectCallHandler(callType)
	})
}
export const closeIncommingCallDialog = () => {
	incommingCallingDialog.style.display = 'none'
}

// caller side
export const showOutgoingCallDialog = (callType, rejectCallHandler) => {

	const rejectCallButton = $('[name=outgoing-call-dialog] [name=call-off-button]')
	outgoingCallDialog.style.display = 'flex'

	rejectCallButton.addEventListener('click', () => {
		closeOutgoingCallDialog()
		rejectCallHandler(callType)
	})
}
export const closeOutgoingCallDialog = () => {
	outgoingCallDialog.style.display = 'none'
}


export const showErrorCallDialog = ({ title='', message= '', delay=4000 }) => {
	const dialogTitle = $('[name=error-call-dialog] [name=dialog-title]')
	const dialogMessage = $('[name=error-call-dialog] [name=dialog-message]')

	errorCallDialog.style.display = 'flex'
	dialogTitle.textContent = title
	dialogMessage.textContent = message

	setTimeout(() => {
		errorCallDialog.style.display = 'none'
		dialogTitle.textContent = ''
		dialogTitle.message = ''
	}, delay);

}
export const closeErrorCallDialog = () => {
	errorCallDialog.style.display = 'none'
}
// showErrorCallDialog({ title: 'testing', message: 'again testing' })



export const updateLocalStream = (stream) => {
	const localVideo = $('[name=local-video]')	
	localVideo.srcObject = stream

	localVideo.addEventListener('loadedmetadata', () => {
		localVideo.autoplay = true
		// localVideo.muted = true
		localVideo.play()
	})
}

export const updateRemoteStream = (stream) => {
	const remoteVideo = $('[name=remote-video]')	
	remoteVideo.srcObject = stream

	remoteVideo.addEventListener('loadedmetadata', () => {
		remoteVideo.autoplay = true
		remoteVideo.play()
	})
	
}



export const updateUIAfterCallClose = () => {
	home.hideCallPanel()
	home.unlockLeftPanel()
	home.enableMessagePanel(false)
	home.clearMessageContainer()

	store.setRemoteStream(null)
	remoteVideo.srcObject=null 	// reset video to it's initial state
}

