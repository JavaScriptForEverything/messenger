import * as ui from './ui.js'
import * as store from './store.js'
import { CALL_STATUS, CALL_TYPE, OFFER_TYPE } from '../module/constants.js'
import { getFilteredUsers } from './http.js'

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

		const { data: friends, message } = await getFilteredUsers()
		if(message) {
			ui.doShowNotFoundFriends()	
			ui.showError(message)
			return
		}

		// update UI
		ui.doShowNotFoundFriends(false)	
		ui.showFriendLists(friends)
		// console.log(friends)

	})

	socket.on('typing', ({ activeUserId }) => {
		ui.receiveUpdateMessageTypingIndicator({ activeUserId })
	})
	socket.on('message', ({ type, activeUserId, message }) => {
		ui.receiveMessage({ type, activeUserId, message })
	})

	socket.on('call-status', ({ callStatus }) => {
		console.log('call-status: ', { callStatus })
		currentCallStatus = callStatus 						
		// update local variable, so that when send pre-offer can checked
	})

	socket.on('pre-offer', ({ callerUserId, calleeUserId, callType }) => {
		console.log('Step-2: callee-side: handle call request of callee')

		// const OFFER_TYPE = constants.offerType
		// const CALL_STATUS = constants.callStatus
		const { logedInUserId } = store.getState()

		if(calleeUserId === logedInUserId) {
			ui.handlePreOffer({ callerUserId, calleeUserId, callType })
			// console.log('sendPreOffer: ', { callerUserId, calleeUserId, callType })

		} 
		
		// if(callStatus === CALL_STATUS.CALL_BUSY) {
		// 	store.setCallStatus( callStatus )
		// 	// sendPreOfferAnswer({ 
		// 	// 	callerUserId, 
		// 	// 	calleeUserId, 
		// 	// 	offerType: OFFER_TYPE.CALL_UNAVAILABLE, 
		// 	// 	callStatus: CALL_STATUS.CALL_AVAILABLE,
		// 	// })
		// }

		// // console.log({ callerUserId, calleeUserId, callType, callStatus })
	})

	socket.on('pre-offer-answer', ({ callerUserId, calleeUserId, offerType }) => {
		console.log('Step-4: caller-side: finally handle call answer ')
		console.log({ callerUserId, calleeUserId, offerType })

		if(offerType === OFFER_TYPE.CALL_ACCEPTED) {
			ui.callerSideAcceptCallHandler({ callerUserId, calleeUserId })

			console.log('call accepted', { offerType })
		}
		if(offerType === OFFER_TYPE.CALL_REJECTED) {
			ui.rejectCallHandler({ callerUserId, calleeUserId })
			ui.hideVideoContainer()

			console.log('call rejected', { offerType })
		}
		if(offerType === OFFER_TYPE.CALL_CLOSED) {
			console.log('call closed')
			console.log({ offerType })
			ui.hideVideoContainer()

		}
		if(offerType === OFFER_TYPE.CALLEE_NOT_FOUND) {
			console.log('callee not found')
			ui.calleeNotFoundHandler()
		}
		if(offerType === OFFER_TYPE.CALL_UNAVAILABLE) {
			console.log('call CALL_UNAVAILABLE')
			ui.showError('call CALL_UNAVAILABLE')
			// console.log({ offerType, callStatus })
		}

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
	console.log('Step-1: caller-side: send-request to callee')
	socketIo.emit('pre-offer', { callerUserId, calleeUserId, callType })
}
// ui.js: handlePreOffer
export const sendPreOfferAnswer = ({ callerUserId, calleeUserId, offerType }) => { 	
	console.log('Step-3: callee-side: send call answer as respost to caller back')
	// socketIo.emit('pre-offer-answer', { callerUserId, calleeUserId, offerType })
	socketIo.emit('pre-offer-answer', { callerUserId, calleeUserId, offerType }, (arg) => {
		ui.calleeSideAcceptCallHandler({ callerUserId })

	})
}

// ui.js: closeCallHandler
export const sendCloseCallSignal = ({ callerUserId, calleeUserId, offerType }) => {
	socketIo.emit('pre-offer-answer', { callerUserId, calleeUserId, offerType }) 
}

