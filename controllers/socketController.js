let connectedPeers = [] 			// [ { userId, socketId }, ... ]
let busyPeers = [] 						// [ userId1, userId2, ... ]

const CALL_STATUS = { 											// make same callStatus as constants.js in client-side has
	CALLING: 'CALLING',
	CALL_ENGAGED: 'CALL_ENGAGED',
	CALL_BUSY: 'CALL_BUSY',
	CALL_AVAILABLE: 'CALL_AVAILABLE',
	CALL_UNAVAILABLE: 'CALL_UNAVAILABLE',
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
const getPeer = (socketId) => connectedPeers.find( peer => peer.socketId === socketId)

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
	
	// io.emit('call-status', { 
	// 	callStatus: CALL_STATUS.CALL_AVAILABLE,
	// })

	socket.on('user-join', ({ socketId, userId }) => {
		if(!userId) return sendError(socket, { message: 'userId is missing' })

		// create new rooms from logedInUserId
		connectedPeers.push({ socketId, userId })
		socket.join(userId)

		io.emit('user-joinded', { 
			rooms: connectedPeers
		})

		// usersInRoom(io)('aaa')
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


	socket.on('pre-offer', ({ callerUserId, calleeUserId, callType }) => {

		// Step-1: if callee not exinsts any more, close this dialog
		if( !isUserExists(calleeUserId) ) {
			socket.emit('pre-offer-answer', {  							// tell only caller him-self
				callerUserId,
				calleeUserId,
				callType,
				offerType: OFFER_TYPE.CALLEE_NOT_FOUND, 
			})

			io.emit('call-status', { callStatus: CALL_STATUS.CALL_AVAILABLE })

			return
		}

		// Step-2: only allow first call, and tell other user is busy
		busyPeers.push(callerUserId)
		busyPeers.push(calleeUserId)
		
		console.log('pre-offer', busyPeers)

		// Step-3: tell caller that he is engaged
		socket.to(calleeUserId).emit('pre-offer', { 
			callerUserId,
			calleeUserId,
			callType,
		})

		// Step-4.1: tell only caller and callee them-selves is busy
		io.to(calleeUserId).to(callerUserId).emit('call-status', { 
			callStatus: CALL_STATUS.CALLING,
			// callStatus:  isUserGettingCalled ? CALL_STATUS.CALL_BUSY : CALL_STATUS.CALLING,
		})

		// Step-4.2: tell others that, caller and callee is busy
		io.except(calleeUserId).except(callerUserId).emit('call-status', { 
			callStatus: CALL_STATUS.CALL_BUSY,
		})

		// isUserGettingCalled = true

	})


	socket.on('pre-offer-answer', ({ callerUserId, calleeUserId, offerType }) => {
		// isUserGettingCall = false 		// reset first to only allow first call

		console.log({ callerUserId, calleeUserId, offerType })

		/* Step-1: tell caller him self: callee not found
		** if in front-side not select active friend by calleeUserId, then 
		** close call from callee side will failed, because calleeUserId will missing when send
		** close request to this block
		*/ 
		if( !isUserExists(calleeUserId) ) {
			socket.emit('pre-offer-answer', {  							// tell only caller him-self
				callerUserId,
				calleeUserId,
				offerType: OFFER_TYPE.CALLEE_NOT_FOUND,
			})
			io.emit('call-status', { 
				callStatus: CALL_STATUS.CALL_AVAILABLE,
			})
			return
		}

		if( offerType === OFFER_TYPE.CALL_ACCEPTED ) {
			// Step-2: tell only callee 
			io
				.to(calleeUserId)
				.to(callerUserId)
				.emit('pre-offer-answer', { callerUserId, calleeUserId, offerType })
			io
				.to(calleeUserId)
				.to(callerUserId)
				.emit('call-status', { callStatus: CALL_STATUS.CALL_ENGAGED })


			io
				.except(callerUserId)
				.except(calleeUserId)
				.emit('pre-offer-answer', { callerUserId, calleeUserId, offerType })
			io
				.except(calleeUserId)
				.except(callerUserId)
				.emit('call-status', { callStatus: CALL_STATUS.CALL_BUSY })
		}

		if( offerType === OFFER_TYPE.CALL_REJECTED ) {
			io
				.to(calleeUserId)
				.to(callerUserId)
				.emit('pre-offer-answer', { callerUserId, calleeUserId, offerType })

			io.emit('call-status', { callStatus: CALL_STATUS.CALL_AVAILABLE })

			busyPeers = busyPeers
				.filter( userId => userId !== callerUserId)
				.filter( userId => userId !== calleeUserId)

		}

		if( offerType === OFFER_TYPE.CALL_CLOSED ) {
			io
				.to(calleeUserId)
				.to(callerUserId)
				.emit('pre-offer-answer', { callerUserId, calleeUserId, offerType })

			io.emit('call-status', { callStatus: CALL_STATUS.CALL_AVAILABLE })

			busyPeers = busyPeers
				.filter( userId => userId !== callerUserId)
				.filter( userId => userId !== calleeUserId)

			console.log('CALL_CLOSED', busyPeers)
		}


	})

	// socket.on('call-status', () => {
	// 	isUserGettingCalled = false
	// })

	

	socket.on('disconnect', () => {
		connectedPeers = connectedPeers.filter(({ socketId }) => socketId !== socket.id )
		// console.log(connectedPeers)

		io.emit('user-joinded', { 
			rooms: connectedPeers
			// rooms: Array.from(socket.rooms)
		})

		// // reset call-status on user close windows senerio
		// io.emit('call-status', { 
		// 	callStatus: CALL_STATUS.CALL_AVAILABLE,
		// })

		// const peer = getPeer(socket.id)
		// busyPeers = busyPeers.filter( userId => userId !== peer.userId )
	})
}


const sendError = (socket, { message, reason='' }) => {
	socket.emit('error', {
		message,
		reason,
	})
}


// const usersInRoom = (io) => (roomId) => {
// 	const room = io.sockets.adapter.rooms.get(roomId)
// 	// console.log( 'room :', Array.from(room) )

// 	// let roomsSet = io.sockets.adapter.rooms
// 	// roomsSet.forEach( room => {
// 	// 	rooms.push([...room])

// 	// })
// 	// console.log({ rooms: roomsSet })
// 	// rooms = Array.from(room) 
// 	// console.log({ 
// 	// 	room,
// 	// 	roomSize: room.size 
// 	// })
// }