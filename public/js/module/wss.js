import * as ui from './ui.js'
import * as store from './store.js'
import { getFilteredUsers } from './http.js'

/* Global Variables 	
		. io
		. logedInUser
*/


let socketIo = null
// const userId = crypto.randomUUID()
// const userId = 'aaa'
const userId = logedInUser._id


// console.log(logedInUser)


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
		socket.on('user-joinded', async ({ rooms }) => {

			// console.log(rooms)

			const users = []
			rooms.forEach(({ userId }) => users.push(userId))

			// const data = await getFilteredUsers(users)
			// console.log(data)

		})


	})

}

