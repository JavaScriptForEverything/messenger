import * as store from './store.js'
import * as ui from './ui.js'
import * as webRTCHandler from './webRTCHandler.js'
import * as constants from './constants.js'

let socketIo = null

// This function invoded in /js/page/home.js immediately
export const registerSocketEvents = (socket) => {
	socket.on('connect', () => {
	socketIo = socket

		store.setSocketId( socket.id )
		ui.updatePersonalCode( socket.id )

		// Step-2: callee side
		socket.on('pre-offer', (data) => {
			if(!data.callerSocketId) return console.log('server must have to send callerSocketId')
			webRTCHandler.handlePreOffer(data)
		})

		// Step-4: caller side
		socket.on('pre-offer-answer', (data) => {
			if(!data.calleeSocketId) return console.log('server must have to send calleeSocketId')
			webRTCHandler.handlePreOfferAnswer(data)
		// console.log(data)
		})

		// Step-6: WebRTC-step-2: caller get offer
		socket.on('webrtc-signaling', (data) => {
			switch( data.type ) {
				case constants.webRTCSignaling.OFFER: return webRTCHandler.handleWebRTCOffer( data )
				case constants.webRTCSignaling.ANSWER: return webRTCHandler.handleWebRTCAnswer( data )
				case constants.webRTCSignaling.ICE_CANDIDATE: return webRTCHandler.handleWebRTCIceCandidate( data )
			}
		})

		socket.on('webrtc-close-connection', (data) => {
			webRTCHandler.handleClosingCall(data)
		})

		socket.on('call-state', (data) => {
			webRTCHandler.handleCallStartSignal(data)
		})

		socket.on('typing', (data) => {
			ui.toggleTypingIndicator(true)
		})
	})
}


// Step-1: caller side
export const sendPreOffer = (data) => {
	if(!socketIo)	return console.log('socketIo is null')

	socketIo.emit('pre-offer', data)
}

// Step-3: caller side again
export const sendPreOfferAnswer = (data) => {
	socketIo.emit('pre-offer-answer', data)

	// console.log(data)
}

// Step-5: WebRTC-step-1: callee Send offer
export const sendDataUsingWebRTCSignaling = (data) => {
	socketIo.emit('webrtc-signaling', data)
}


export const sendClosingCallSignal = (data) => {
	socketIo.emit('webrtc-close-connection', data)
}


export const sendCallStartSignal = ( data ) => { 		
	socketIo.emit('start-call',  data )
}

export const typingIndicator = ({ calleeId }) => {
	socketIo.emit('typing', { calleeId })
}