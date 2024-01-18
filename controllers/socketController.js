let connectedPeers = []


module.exports = (io) => (socket) => {
	// connectedPeers.push(socket.id)
	// console.log(connectedPeers)


	socket.on('disconnect', () => {
		connectedPeers = connectedPeers.filter(socketId => socket.id !== socketId)
		// console.log(connectedPeers)
	})
}

