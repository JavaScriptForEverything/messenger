let connectedPeers = []
let isUserGettingCall = false

const CALL_STATUS = { 											// make same callStatus as constants.js in client-side has
	CALL_AVAILABLE: 'CALL_AVAILABLE',
	CALL_UNAVAILABLE: 'CALL_UNAVAILABLE',
	CALL_BUSY: 'CALL_BUSY',
	CALL_ENGAGED: 'CALL_ENGAGED',
}
const OFFER_TYPE = {
	CALL_ACCEPTED 	: 'CALL_ACCEPTED',
	CALL_REJECTED 	: 'CALL_REJECTED',
	CALL_CLOSED 		: 'CALL_CLOSED',
	CALLEE_NOT_FOUND: 'CALLEE_NOT_FOUND', 		// if try to call to a personalCode which not exists in backend
	CALL_UNAVAILABLE: 'CALL_UNAVAILABLE', 		// if already calling someone: more than 2 user not allowed by WebRTC
}

const isUserExists = (userId) => {
	const user = connectedPeers.find( peer => userId === peer.userId )
	return user ? true : false
}
// let rooms = []

// const testing = (io) => (socket) => {
// 	rooms = Array.from( socket.rooms ) 		// method-1: convert set to pure array

// 	console.log(rooms)

// 	// rooms.forEach( (roomId) => {
// 	// 	const clients = [ ...io.sockets.adapter.rooms.get( roomId ) ] 	// method-2: convert to pure array

// 	// 	clients.forEach( (clientId) => { 													// add socket.id connected to particular room 
// 	// 		console.log({ clientId })
// 	// 	})
// 	// })

// 	// console.log(socket.rooms)
// 	// console.log(io.sockets.adapter.rooms)
// }

module.exports = (io) => (socket) => {
	// connectedPeers.push(socket.id)
	// console.log(connectedPeers)
	// console.log(socket.id)
	// testing(io)(socket)

	socket.on('user-join', ({ socketId, userId }) => {
		if(!userId) return sendError(socket, { message: 'userId is missing' })

		connectedPeers.push({ socketId, userId })
		socket.join(userId)

		io.emit('user-joinded', { 
			rooms: connectedPeers
		})

		usersInRoom(io)('aaa')
	})

	socket.on('typing', ({ activeUserId }) => {
		if( !isUserExists(activeUserId) ) return  // only send typing if activeUser is selected in front-end

		// emit to this user : by private roomId === activeUser._id
		socket.to(activeUserId).emit('typing', { activeUserId })
	})

	socket.on('message', ({ type, activeUserId, message }) => {
		if( !isUserExists(activeUserId) ) return  // if callee not exists then return

		socket.to(activeUserId).emit('message', { type, activeUserId, message })
	})


	socket.on('pre-offer', ({ activeUserId, callType, callStatus }) => {

		// Step-1: if callee not exinsts any more, close this dialog
		if( !isUserExists(activeUserId) ) {
			socket.emit('pre-offer-answer', {  							// tell only caller him-self
				callType,
				offerType: OFFER_TYPE.CALLEE_NOT_FOUND, 
				callStatus: CALL_STATUS.CALL_UNAVAILABLE,
				activeUserId, 
			})
			return
		}

		// // Step-2: only allow first call, and tell other user is busy
		// if(callStatus === CALL_STATUS.CALL_BUSY && isUserGettingCall) {
		// 	socket.emit('pre-offer', { 
		// 		callType, 
		// 		callStatus: CALL_STATUS.CALL_BUSY,
		// 		activeUserId, 
		// 	})
		// 	return

		// } else {
		// 	isUserGettingCall = false
		// }

		// isUserGettingCall = true


		// Step-2: tell caller that he is engaged
		socket.to(activeUserId).emit('pre-offer', { 
			callType, 
			callStatus: CALL_STATUS.CALL_ENGAGED,
			activeUserId, 
		})

		// Step-3: tell others that caller is busy
		// socket.broadcast.emit('pre-offer', { 
		io.except(activeUserId).except(socket.id).emit('pre-offer', { 
			callType, 
			callStatus: CALL_STATUS.CALL_BUSY,
			activeUserId, 
		})
	})


	socket.on('pre-offer-answer', ({ offerType, activeUserId, callStatus }) => {
		// Step-1: tell caller him self: callee not found
		if( !isUserExists(activeUserId) ) {
			socket.emit('pre-offer-answer', {  							// tell only caller him-self
				offerType: OFFER_TYPE.CALLEE_NOT_FOUND,
				activeUserId, 
				status: CALL_STATUS.CALL_AVAILABLE 
			})
			return
		}

		// Step-2: tell only callee 
		socket.to(activeUserId).emit('pre-offer-answer', { 
			offerType, 
			activeUserId,
			callStatus: CALL_STATUS.CALL_ENGAGED
		})

		// Step-3: tell others 
		socket.broadcast.emit('pre-offer-answer', { 
		// io.except(activeUserId).emit('pre-offer-answer', { 
			offerType, 
			activeUserId,
			callStatus: CALL_STATUS.CALL_BUSY
		})


	})

	socket.on('disconnect', () => {
		connectedPeers = connectedPeers.filter(({ socketId }) => socketId !== socket.id )
		// console.log(connectedPeers)

		io.emit('user-joinded', { 
			rooms: connectedPeers
			// rooms: Array.from(socket.rooms)
		})
	})
}


const sendError = (socket, { message, reason='' }) => {
	socket.emit('error', {
		message,
		reason,
	})
}


const usersInRoom = (io) => (roomId) => {
	const room = io.sockets.adapter.rooms.get(roomId)
	// console.log( 'room :', Array.from(room) )

	// let roomsSet = io.sockets.adapter.rooms
	// roomsSet.forEach( room => {
	// 	rooms.push([...room])

	// })
	// console.log({ rooms: roomsSet })
	// rooms = Array.from(room) 
	// console.log({ 
	// 	room,
	// 	roomSize: room.size 
	// })
}