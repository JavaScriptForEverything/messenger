import * as ui from './ui.js'
import * as store from './store.js'
import * as http from './http.js'
import * as webRTC from './webRTC.js'
import { CALL_STATUS, OFFER_TYPE, WEB_RTC_SIGNAL } from '../module/constants.js'

/* Global Variables 	
		. io
		. logedInUser
*/


let socketIo = null
// const userId = crypto.randomUUID()
// const userId = 'aaa'
const userId = logedInUser._id
export let currentCallStatus = CALL_STATUS.CALL_AVAILABLE



/* 
. Every listener must be inside this function else 	socket 	must be null
. Others listener or emits can be inside 'connect' listener or outsit of it, but isside is safe zone
. When we need to fire events (emit) we use inside or outside by socketIo variable, but
	using inside a function is safe zone and that function we be invoke inside 'connect' event
*/
export const registerSocketEvents = (socket) => {

	socket.on('connect', () => {
		socketIo = socket
		store.setLogedInUser( logedInUser ) 	// logedInUser comes from backend
		// store.setCallStatus(CALL_STATUS.CALL_AVAILABLE)

		socket.emit('user-join', { socketId: socket.id, userId })
	})

	socket.on('error', ({ message, reason }) => {
		ui.showError(message, reason)
	})
	socket.on('user-joinded', async ({ rooms }) => {

		store.setRooms(rooms)

		const { data: friends, message } = await http.getFilteredUsers()
		if(message) {
			ui.showError(message)
			ui.showFriendsNotFoundUI()
			return
		}

		ui.showFriendsListContainerUI()
		ui.showFriendLists(friends)
	})

	socket.on('typing', ({ activeUserId }) => {
		ui.receiveUpdateMessageTypingIndicator({ activeUserId })
	})
	socket.on('message', ({ type, activeUserId, message }) => {
		ui.receiveMessage({ type, activeUserId, message })
	})

	socket.on('call-status', ({ callStatus }) => {
		// console.log('call-status: ', { callStatus })
		currentCallStatus = callStatus 						
	})

	socket.on('pre-offer', ({ callerUserId, calleeUserId, callType }) => {
		// console.log('Step-2: callee-side: handle call request of callee')

		const isCalling = currentCallStatus === CALL_STATUS.CALLING 
		const isEngaged = currentCallStatus === CALL_STATUS.CALL_ENGAGED

		if(isCalling || isEngaged) {
			sendCallBusySignal({ callerUserId, calleeUserId, callType })
			return 
		}

		const { logedInUserId } = store.getState()

		if(calleeUserId === logedInUserId) {
			ui.handlePreOffer({ callerUserId, calleeUserId, callType })
		} 
	})

	socket.on('pre-offer-answer', ({ callerUserId, calleeUserId, offerType }) => {
		// console.log('Step-4: caller-side: finally handle call answer ')

		if(offerType === OFFER_TYPE.CALL_ACCEPTED) {
			ui.callerSideAcceptCallHandler()
		}
		if(offerType === OFFER_TYPE.CALL_REJECTED) {
			ui.callerSideRejectCallHandler()
		}

		if(offerType === OFFER_TYPE.CALL_CLOSED) {
			ui.hideVideoContainer()
		}
		if(offerType === OFFER_TYPE.CALLEE_NOT_FOUND) {
			ui.calleeNotFoundHandler()
		}
		if(offerType === OFFER_TYPE.CALL_UNAVAILABLE) {
			ui.showError('call CALL_UNAVAILABLE')
			// console.log({ offerType, callStatus })
		}

	})

	socket.on('call-busy', ({ callerUserId, calleeUserId, callStatus }) => {
		// console.log('Step-6: caller-side: handle call busy signal')
		ui.callerSideBusyCallHandler()
		currentCallStatus = CALL_STATUS.CALL_AVAILABLE
	})

	socket.on('close-connection', ({ callerUserId }) => {
		const { activeUserId } = store.getState()

		if(callerUserId === activeUserId ) {
			console.log({ callerUserId, activeUserId })
			ui.closeCallHandler()
			ui.hideCallingDialog()
			webRTC.closeHandler()
		}
	})

	socket.on('webrtc-offer', ({ offer, callerUserId }) => {
		webRTC.handleWebRTCOfferAndSendAnswer({ offer, callerUserId })
	})
	socket.on('webrtc-answer', ({ callerUserId, answer }) => {
		webRTC.handleWebRTCAnswer({ callerUserId, answer })
	})
	socket.on('webrtc-candidate', ({ callerUserId, candidate }) => {
		webRTC.handleIceCandidate({ candidate })
	})

}

export const sendMessageTypingIndicator = ({ activeUserId }) => {
	socketIo.emit('typing', { activeUserId })
}
export const sendMessage = ({ type, activeUserId, message }) => {
	socketIo.emit('message', { type, activeUserId, message })
}

// ui.js: audioCallHandler
export const sendPreOffer = ({ callerUserId, calleeUserId, callType }) => { 	
	// console.log('Step-1: caller-side: send-request to callee')
	socketIo.emit('pre-offer', { callerUserId, calleeUserId, callType })
}
// ui.js: handlePreOffer
export const sendPreOfferAnswer = ({ callerUserId, calleeUserId, offerType }) => { 	
	// console.log('Step-3: callee-side: send call answer as respost to caller back')
	socketIo.emit('pre-offer-answer', { callerUserId, calleeUserId, offerType }, (arg) => {
		ui.calleeSideAcceptCallHandler({ callerUserId })
	})
}

// ui.js: closeCallHandler
export const sendCloseCallSignal = ({ callerUserId, calleeUserId, offerType }) => {
	socketIo.emit('pre-offer-answer', { callerUserId, calleeUserId, offerType }) 
}

// wss.js: on('pre-offer', {...})
export const sendCallBusySignal = ({ callerUserId, calleeUserId, callType }) => { 	
	// console.log('Step-5: callee-side: send call busy signal')
	socketIo.emit('call-busy', { callerUserId, calleeUserId, callType }, () => {

		console.log('Step-5.1: callee-side: on response')
	})
}


export const sendOffer = ({ callerUserId, calleeUserId, offer }) => {
	socketIo.emit('webrtc-offer', { callerUserId, calleeUserId, offer })
}

export const sendAnswer = ({ callerUserId, calleeUserId, answer }) => {
	socketIo.emit('webrtc-answer', {  callerUserId, calleeUserId, answer })
}
export const sendIceCandedate = ({ callerUserId, calleeUserId, candidate }) => {
	console.log({ callerUserId, calleeUserId, candidate })
	socketIo.emit('webrtc-candidate', { callerUserId, calleeUserId, candidate })
}

