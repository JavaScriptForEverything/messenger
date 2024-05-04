import * as store from './store.js'


const tempUserIds = [
  "6603b309c39dffe6f5a3aba6", 	// ayan
  "6606b8c47844a6763050de3c", 	// riajul
	"6606f381e629d675c08c85b8",
	"6606f3a6e629d675c08c85ba"
]


export const addOnlineProperty = (data) => {
	if(!data) return console.log(`data must be array or object, but got ${data}`)

	const rooms = store.getState().rooms
	const logedInUser = store.getState().logedInUser
	
	// const usersIds = []
	const usersIds = tempUserIds
	let output = null

	rooms
		.filter((room ) => room.userId !== logedInUser._id) 	
		.forEach(({ userId }) =>  usersIds.push(userId))

	if(Array.isArray(data)) {
		output = data.map( doc => usersIds.includes( doc._id ) ?  { ...doc, isOnline: true } : { ...doc, isOnline: false } )

	} else {
		const doc = data
		output = usersIds.includes( doc._id ) ? { ...doc, isOnline: true } : { ...doc, isOnline: false } 
	}

	return output
}


// wss.js: on('user-joined', {})
export const getFilteredUsers = async () => {
	try {
		const res = await fetch(`/api/users/friends`)
		if( !res.ok ) throw await res.json()

		let output = await res.json()
		output.data = addOnlineProperty(output.data)

		return output

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

		const output = await res.json()
		// console.log( store.getState().rooms)

		output.data = addOnlineProperty(output.data)

		return output

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


export const toggleFollow = async (selectedUserId) => {
	try {
		const res = await fetch(`/api/users/${selectedUserId}/follow-unfollow`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
		})
		if( !res.ok ) throw await res.json()

		return await res.json()

	} catch (err) {
		return err
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


export const filterAttachments = async (search) => {
	try {
		const query = `_search=${search},message,type`
		const res = await fetch(`/api/messages?${query}`)
		if( !res.ok ) throw await res.json()

		return await res.json()

	} catch (err) {
		return err
	}
}


// // PATCH 	/api/users/:id
// export const updateUserById = async (userId, body) => {
// 	try {
// 		const res = await fetch(`/api/users/${userId}`, {
// 			method: 'PATCH',
// 			body: JSON.stringify(body),
// 			headers: {
// 				'Content-Type': 'application/json',
// 				'Accept': 'application/json',
// 			}
// 		})
// 		if( !res.ok ) throw await res.json()

// 		return await res.json()

// 	} catch (err) {
// 		return err
// 	}
// }

// PATCH 	/api/users/:id/photos
export const updateUserPhotos = async (userId, body) => {
	try {
		const res = await fetch(`/api/users/${userId}/photos`, {
			method: 'PATCH',
			body: JSON.stringify(body),
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			}
		})
		if( !res.ok ) throw await res.json()

		return await res.json()

	} catch (err) {
		return err
	}
}


// GET 	/api/users/:id/followers-followings
export const getFollowFollowing = async (selectedUserId) => {
	try {
		const res = await fetch(`/api/users/${selectedUserId}/followers-followings`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
		})
		if( !res.ok ) throw await res.json()

		return await res.json()

	} catch (err) {
		return err
	}
}