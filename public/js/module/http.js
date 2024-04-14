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

		const res = await fetch(`/api/users/friends`)
		if( !res.ok ) throw await res.json()

		let output = await res.json()
		output.data = output.data
		.filter( doc => doc.id !== "6606b8c47844a6763050de3c")
		.map( doc => userIds.includes( doc.id ) ? { ...doc, isOnline: true } : doc)

		return output
		// return await res.json()

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

export const getAllChatMessages = async (payload = {}) => {
	try {
		if(!payload.sender || !payload.receiver) throw new Error('psease provide senderId and receiverId')

		const searchParams = new URLSearchParams(payload)
		const query = searchParams.toString()

		const res = await fetch(`/api/messages/chats?${query}`)
		if( !res.ok ) throw await res.json()

		return await res.json()

	} catch (error) {
		return error
	}
}

/*
const payload = {
	sender: logedInUser._id,
	receiver: selectedUser.id,
	message: input.value, 			: 'your message' | 'data:image/jpge;base64,...'
	type: 'text', 							: text | image | file | audio
}
*/
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



// export const getSearchUser = async (payload, signal) => {
// 	try {
// 		const res = await fetch('/api/users/friends', {
// 			method: 'GET',
// 			headers: {
// 				'Content-Type': 'application/json',
// 				'Accept': 'application/json',
// 			},
// 			signal
// 		})
// 		if( !res.ok ) throw await res.json()

// 		return await res.json()

// 	} catch (err) {
// 		if( err.name === 'AbortError') return
// 		return err
// 	}
// }