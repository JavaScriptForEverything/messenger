const tempUserIds = [
  "6603b309c39dffe6f5a3aba6", 	// ayan
  "6606b8c47844a6763050de3c", 	// riajul
	"6606f381e629d675c08c85b8",
	"6606f3a6e629d675c08c85ba"
]
export const getFilteredUsers = async (userIds) => {
	userIds = tempUserIds
	try {
		// const res = await fetch(`/api/users/filtered-users`, {
		// 	method: 'POST',
		// 	body: JSON.stringify({ userIds }),
		// 	headers: {
		// 		'Content-Type': 'application/json',
		// 		'Accept': 'application/json',
		// 	}
		// })

		// const res = await fetch(`/api/users`)
		const res = await fetch(`/api/users/friends`)
		if( !res.ok ) throw await res.json()

		return await res.json()

	} catch (error) {
		return error
	}

}

export const logout = async () => {
	try {
		const res = await fetch(`/api/auth/logout`)
		if( !res.ok ) throw await res.json()

		return await res.json()

	} catch (error) {
		return error
	}
}


export const getSelectedUser = async (userId) => {
	try {
		const res = await fetch(`/api/users/${userId}`)
		if( !res.ok ) throw await res.json()

		return await res.json()

	} catch (error) {
		return error
	}
}


export const getAllMessages = async () => {
	try {
		const res = await fetch(`/api/messages`)
		if( !res.ok ) throw await res.json()

		return await res.json()

	} catch (error) {
		return error
	}
}

export const getAllChatMessages = async ({ sender, receiver } = {}) => {
	try {
		if(!sender || !receiver) throw new Error('psease provide senderId and receiverId')

		const res = await fetch('/api/messages/chats', {
			method: 'POST',
			body: JSON.stringify({ sender, receiver }),
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			}
		})
		if( !res.ok ) throw await res.json()

		return await res.json()

	} catch (error) {
		return error
	}
}
export const createMessage = async (payload) => {
	try {
		const res = await fetch('/api/messages', {
			method: 'POST',
			body: JSON.stringify(payload),
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			}
		})
		if( !res.ok ) throw await res.json()

		return await res.json()

	} catch (error) {
		return error
	}
}

	// clearTimeout(timer)
	// timer = setTimeout(async() => {
	// 	if(controller) controller.abort('abort message')

	// 	controller = new AbortController()
	// 	const { signal } = controller

	// 	try {
	// 		// const res = await fetch('/api/users', { signal })
	// 		const res = await fetch('/api/messages', {
	// 			method: 'POST',
	// 			body: JSON.stringify(payload)
	// 		})
	// 		const data = await res.json()
	// 		console.log(data)

	// 	} catch (err) {
	// 		if( err.name === 'AbortError') return

	// 		console.log(err)	
	// 		console.log(signal.reason, signal.aborted)
	// 	}
	// }, 10)