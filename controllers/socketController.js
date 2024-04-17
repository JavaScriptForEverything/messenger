let connectedPeers = []

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
		// socket.emit('typing', { activeUserId })
		if( !isUserExists(activeUserId) ) return  // only send typing if activeUser is selected in front-end

		// emit to this user : by private roomId === activeUser._id
		socket.to(activeUserId).emit('typing', { activeUserId })
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