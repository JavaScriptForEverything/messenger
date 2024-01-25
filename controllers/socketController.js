let connectedPeers = []
let rooms = []


module.exports = (io) => (socket) => {
	// connectedPeers.push(socket.id)
	// console.log(connectedPeers)

	socket.on('user-join', ({ socketId, userId }) => {
		if(!userId) return sendError(socket, { message: 'userId is missing' })

		connectedPeers.push({ socketId, userId })
		socket.join(userId)

		io.emit('user-joinded', { 
			rooms: connectedPeers
		})

		usersInRoom(io)('aaa')
		// console.log(connectedPeers)

	})


	socket.on('disconnect', () => {
		connectedPeers = connectedPeers.filter(({ socketId }) => socketId !== socket.id )
		// console.log(connectedPeers)
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
	console.log( room )

	// console.log({ 
	// 	room,
	// 	roomSize: room.size 
	// })
}