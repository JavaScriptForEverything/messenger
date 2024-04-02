import { Snackbar } from './components/index.js'
import { $, redirectTo, readAsDataURL } from './utils.js'
import * as elements from '../module/elements.js'
import * as http from './http.js'

const middleTop = $('[name=middle-top]')
// const middleTopAvatar = middleTop.querySelector('[name=avatar]')
// const middleTopUsername = middleTop.querySelector('[name=username]')
// console.log(middleTopAvatar, middleTopUsername)
const leftPanelAvatar = $('[name=left-top] [name=list-container] img')
const friendsNotFound = $('[name=friends-not-found]') 	
const friendsListContainer = $('[name=friends-list-container]') 	
// const messageContainer = $('[name=message-container]') 	
const textMessagesContainer = $('[name=text-message-container]') 			// only override messages not video containers too used for video call

const sendMessageForm = $('form[name=middle-bottom]')
const writeMessageInput = $('[name=write-message-input]') 	
const cameraIconButtonInput = $('#camera-icon-button')


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

	const { status, message } = await http.logout()
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

// wss.js => const registerSocketEvents = () => {...}
export const showFriendLists = (friends=[]) => {
	friends.forEach((friend) => {
		elements.createFirendList(friendsListContainer, {
			// --- user details
			id: friend.id,
			avatar: friend.avatar,
			name: friend.fullName,
			// isActive: true,

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
	handleListSelection(friends)
}


const handleListSelection = (friends) => {
	const friendsListItems = Array.from(friendsListContainer.querySelectorAll('[name=list-container'))

	// initial user is first friends
	selectedUserHandler(friends[0])

	friendsListContainer.addEventListener('click', async (evt) => {
		const selectedUserId = evt.target.id

		const { data: selectedUser, message } = await http.getSelectedUser(selectedUserId)
		if(message) showError(message)

		selectedUserHandler(selectedUser)

		friendsListItems.forEach( el => {
			el.classList.toggle('selected', el.id === selectedUserId) 
		})

	})

}


const selectedUserHandler = (user) => {
	const selectedUserListContainer = $('[name=selected-user-list-container]')
	const avatarImg = selectedUserListContainer.querySelector('[name=avatar]')
	const avatarBadge = selectedUserListContainer.querySelector('[name=avatar-badge]')
	const nameP = selectedUserListContainer.querySelector('[name=username]')
	
	selectedUserListContainer.id = user.id
	avatarImg.src = user.avatar
	avatarBadge.classList.toggle('active', true) 	// if user active then make true
	nameP.textContent = user.fullName

	// // show userId without page refresh: problem require #userId=undefined on page load
	// const url = new URL(location.href)
	// url.hash = `userId=${user.id}`
	// location.href = url
	// console.log(url.hash)

	showAllMessagesInUI(user.id)
}

const showAllMessagesInUI = async (receiver) => {
	textMessagesContainer.innerHTML = '' 		// empty container before add new items


	const payload = {
		sender: logedInUser._id,
		receiver
	}
	
	const { data:messages, message } = await http.getAllChatMessages(payload)
	if(message) return showError(message)

	messages.forEach(messageDoc => {
		// console.log(messageDoc)
		// show error alert for not populated senerio
		if(messageDoc.sender.id === logedInUser._id) {
			elements.createYourMessage(textMessagesContainer, { 
				type: messageDoc.type,
				message: messageDoc.message 
			})

		} else {
			elements.createTheirMessage(textMessagesContainer, { 
				type: messageDoc.type,
				message: messageDoc.message,
				avatar: messageDoc.sender.avatar
			})

		}
	})
}



// ----------[ send message ]----------
writeMessageInput.addEventListener('input', () => {
	let timer = 0
	// handle socket typeing indication
	const selectedUserListContainer = $('[name=selected-user-list-container]')
	const titleP = selectedUserListContainer.querySelector('[name=title]')


	clearTimeout(timer)
	timer = setTimeout(() => {
		titleP.classList.add('hidden') 		// hide typing... indicator from top
	}, [1000])
})
sendMessageForm.addEventListener('submit', async (evt) => {
	evt.preventDefault()

	const selectedUserListContainer = $('[name=selected-user-list-container]')

	const payload = {
		sender: logedInUser._id,
		receiver: selectedUserListContainer.id,
		message: writeMessageInput.value,
		type: 'text',
	}

	const { data:messageDoc, message } = await http.createMessage(payload)
	if(message) return showError(message)

	elements.createYourMessage(textMessagesContainer, { 
		type: messageDoc.type, 
		message: messageDoc.message
	})
	writeMessageInput.value = '' 	// reset

	// send the messageDoc via wss to other end to handle
})


// ----------[ image upload ]----------
cameraIconButtonInput.addEventListener('change', async (evt) => {
	try {
		const selectedUserListContainer = $('[name=selected-user-list-container]')
		const dataUrl = await readAsDataURL(evt.target.files[0])

		const payload = {
			sender: logedInUser._id,
			receiver: selectedUserListContainer.id,
			message: dataUrl,
			type: 'image'
		}
		const { data:messageDoc, message } = await http.createMessage(payload)
		if(message) return showError(message)

		console.log(messageDoc)

		elements.createYourMessage(textMessagesContainer, { 
			type: 'image', 
			message: messageDoc.message,
		})

		// send this element via wss
			// elements.createTheirMessage(textMessagesContainer, { 
			// 	type: 'image', 
			// 	// message: messageDoc.message,
			// 	// avatar: messageDoc.sender.avatar
			// })

	} catch (err) {
		showError(err.message)
	}
})
	// const payload = {
	// 	sender: logedInUser._id,
	// 	receiver
	// }
	
	// const { data:messages, message } = await http.getAllChatMessages(payload)
	// if(message) return showError(message)

	// messages.forEach(messageDoc => {
	// 	// console.log(messageDoc)
	// 	// show error alert for not populated senerio
	// 	if(messageDoc.sender.id === logedInUser._id) {
	// 		elements.createYourMessage(textMessagesContainer, { 
	// 			type: 'text', 
	// 			message: messageDoc.message 
	// 		})

	// 	} else {
	// 		elements.createTheirMessage(textMessagesContainer, { 
	// 			type: 'text', 
	// 			message: messageDoc.message,
	// 			avatar: messageDoc.sender.avatar
	// 		})

	// 	}
	// })