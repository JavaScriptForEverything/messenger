import * as ui from './ui.js'
import * as store from './store.js'
import * as constants from './constants.js'
import { getFilteredUsers } from './http.js'

/* Global Variables 	
		. io
		. logedInUser
*/


let socketIo = null
// const userId = crypto.randomUUID()
// const userId = 'aaa'
const userId = logedInUser._id




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

	socket.on('pre-offer', ({ callType, activeUserId, callStatus }) => {
		ui.handlePreOffer({ callType, activeUserId, callStatus })
	})
	socket.on('pre-offer-answer', ({ offerType, activeUserId, callStatus }) => {
		// ui.handlePreOffer({ type, activeUserId })
		const OFFER_TYPE = constants.offerType

		if(offerType === OFFER_TYPE.CALL_ACCEPTED) {
			console.log('call accepted')
			console.log({ offerType, callStatus })
		}
		if(offerType === OFFER_TYPE.CALL_REJECTED) {
			console.log('call rejected')
			console.log({ offerType, callStatus })
		}
		if(offerType === OFFER_TYPE.CALL_CLOSED) {
			console.log('call closed')
			console.log({ offerType, callStatus })
		}
		if(offerType === OFFER_TYPE.CALLEE_NOT_FOUND) {
			console.log('callee not found')
			console.log({ offerType, callStatus })
		}
		if(offerType === OFFER_TYPE.CALL_UNAVAILABLE) {
			console.log('call CALL_UNAVAILABLE')
			console.log({ offerType, callStatus })
		}

	})

}

export const sendMessageTypingIndicator = ({ activeUserId }) => {
	socketIo.emit('typing', { activeUserId })
}
export const sendMessage = ({ type, activeUserId, message }) => {
	socketIo.emit('message', { type, activeUserId, message })
}

// home.js: audioCallHandler
export const sendPreOffer = ({ activeUserId, callType, callStatus }) => {
	socketIo.emit('pre-offer', { callType, activeUserId, callStatus })

	console.log('sendPreOffer: ', { activeUserId, callType, callStatus })
}
// ui.js: handlePreOffer
export const sendPreOfferAnswer = ({ offerType, activeUserId, callStatus }) => {
	socketIo.emit('pre-offer-answer', { offerType, activeUserId, callStatus })
	console.log({ offerType, activeUserId, callStatus })
}
