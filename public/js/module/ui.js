import { Snackbar } from './components/index.js'
import { $, redirectTo } from './utils.js'
import * as elements from '../module/elements.js'
// import * as store from './store.js'
import { logout } from './http.js'

const middleTop = $('[name=middle-top]')
// const middleTopAvatar = middleTop.querySelector('[name=avatar]')
// const middleTopUsername = middleTop.querySelector('[name=username]')
// console.log(middleTopAvatar, middleTopUsername)
const leftPanelAvatar = $('[name=left-top] [name=list-container] img')
const friendsNotFound = $('[name=friends-not-found]') 	
const leftFriendPanel = $('[name=left-main]') 	

// const updateAvatar = (parentSelector) => {
// 	const avatar = parentSelector.querySelector('[name=avatar]')
// 	avatar.src = logedInUser.avatar
// }
// updateAvatar(middleTop)

// console.log(logedInUser)

export const showError = (message, reason) => {
	console.log(message)
	Snackbar({
		severity: 'error',
		message
	})
}


const getChatById = async (chatId) => {
	try {
		const res = await fetch('/api/users', {
			method: 'GET',
			headers: {
				'content-type': 'application/json'
			}
		})

		if(!res.ok) throw await res.json()

		const { status, data } = await res.json()
		console.log(data)

	} catch (err) {
		console.log(err)		
	}
}

// const getLogedInUser = async () => {
// 	try {
// 		const res = await fetch('/api/users', {
// 			method: 'GET',
// 			headers: {
// 				'content-type': 'application/json'
// 			}
// 		})

// 		if(!res.ok) throw await res.json()

// 		const { status, data } = await res.json()
// 		console.log(data)

// 	} catch (err) {
// 		console.log(err)		
// 	}
// }
// getLogedInUser()

leftPanelAvatar.style.cursor = 'pointer'
leftPanelAvatar.addEventListener('click', async (evt) => {
	// const img = evt.target
	// console.log(img)

	const { status, message } = await logout()
	if(status === 'success') return redirectTo('/login')
	
	Snackbar({
		severity: 'error', 											// success | info | warning | error
		message,
		// position: 'top-1 right-1' 						// tailwind class
		// variant: 'filled', 									// text | contained | filled
		// showSeverity: false,
		// action: true,
		// autoClose: true,
		// closeTime: 20000,
		// title: 'Testing'
	})
	
})

export const doShowNotFoundFriends = (isShown=true) => {
	if(!isShown) friendsNotFound.classList.toggle('hidden')
}

export const showFriendLists = (friends=[]) => {
	friends.forEach((friend) => {
		elements.createFirendList(leftFriendPanel, {
			// --- user details
			id: friend.id,
			avatar: friend.avatar,
			name: friend.fullName,
			isActive: true,

			// --- latestMessage 	details
			type: 'image',
			message: 'hi there whats going nothing happends', 				 // only required on type='text'
			createdAt: Date.now(friend.createdAt), 

			// --- Notification details
			// isNoNotification: true, 			// hide both new notification + success notification
			notificationValue:  2,
			isNotification: true, 				// for New notification: to work 'isNoNotification' must be false
			isMessageSuccess: true, 				// for seen notification: to work 'isNotification' must be false
		})
	})
}
