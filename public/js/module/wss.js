import * as ui from './ui.js'

let socketIo = null
// const userId = crypto.randomUUID()
const userId = 'aaa'

/* 
. Every listener must be inside this function else 	socket 	must be null
. Others listener or emits can be inside 'connect' listener or outsit of it, but isside is safe zone
. When we need to fire events (emit) we use inside or outside by socketIo variable, but
	using inside a function is safe zone and that function we be invoke inside 'connect' event
*/
export const registerSocketEvents = (socket) => {


	socket.on('connect', () => {
		socketIo = socket
		socket.on('error', ({ message, reason }) => {
			ui.showError(message, reason)
		})


		socket.emit('user-join', { socketId: socket.id, userId })
		socket.on('user-joinded', ({ rooms }) => {
			const uniqueArray = [ ...new Set(rooms) ]
			console.log(uniqueArray)
		})


	})

}

