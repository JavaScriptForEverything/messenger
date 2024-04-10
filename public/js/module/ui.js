import { Snackbar } from './components/index.js'
import { $, redirectTo, readAsDataURL } from './utils.js'
import * as elements from '../module/elements.js'
import * as http from './http.js'

// const middleTop = $('[name=middle-top]')
// const middleTopAvatar = middleTop.querySelector('[name=avatar]')
// const middleTopUsername = middleTop.querySelector('[name=username]')
// console.log(middleTopAvatar, middleTopUsername)
const leftPanelAvatar = $('[name=left-top] [name=list-container] img')
const leftPannelSlideButtonInputCheckbox = $('#left-side-checkbox')
const friendsNotFound = $('[name=friends-not-found]') 	
const friendsListContainer = $('[name=friends-list-container]') 	
// const messageContainer = $('[name=message-container]') 	
const textMessagesContainer = $('[name=text-message-container]') 			// only override messages not video containers too used for video call

const attachmentButtonInput = $('#attachment-icon-button')
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

	showAllMessagesInUI(user.id) 				// hide Messages for now
	leftPannelSlideButtonInputCheckbox.checked = false
}

const showAllMessagesInUI = async (receiver) => {
	textMessagesContainer.innerHTML = '' 		// empty container before add new items


	const payload = {
		sender: logedInUser._id,
		receiver
	}
	
	const { data:messages, message:errorMessage } = await http.getAllChatMessages(payload)
	if(errorMessage) return showError(errorMessage)

	messages.forEach(messageDoc => {
		// console.log(messageDoc)
		// show error alert for not populated senerio
		if(messageDoc.sender.id === logedInUser._id) {

			if(messageDoc.type === 'audio') {
				elements.createYourAudio(textMessagesContainer, { 
					avatar: logedInUser.avatar,
					audioUrl: messageDoc.message,
					audioDuration: messageDoc.duration,
					createdAt: messageDoc.createdAt
				})

			} else {
				elements.createYourMessage(textMessagesContainer, { 
					type: messageDoc.type,
					message: messageDoc.message 
				})
			}


		} else {
			if(messageDoc.type === 'audio') {
				elements.createTheirAudio(textMessagesContainer, { 
					avatar: logedInUser.avatar,
					audioUrl: messageDoc.message,
					audioDuration: messageDoc.duration,
					createdAt: messageDoc.createdAt
				})

			} else {
				elements.createTheirMessage(textMessagesContainer, { 
					type: messageDoc.type,
					message: messageDoc.message,
					avatar: messageDoc.sender.avatar
				})
			}

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

// ----------[ audio upload ]----------
export const showAudio = async (blob, audio, audioDuration) => {
	try {
		// Step-1: Show Audio in UI
		audio.srcObject = null 	// remove old audio.srcObject added in record starting time

		const dataUrl = await readAsDataURL(blob, { type: 'audio' })
		// const dataUrl = URL.createObjectURL(blob)
		audio.src = dataUrl
		audio.controls = true
		audio.autoplay = false
		//- URL.revokeObjectURL(dataUrl) 	// Don't remove url, else audio will be no more

		// Step-2: Send audio to backend
		const selectedUserListContainer = $('[name=selected-user-list-container]')
		const payload = {
			sender: logedInUser._id,
			receiver: selectedUserListContainer.id,
			message: dataUrl,
			type: 'audio',
			duration: audioDuration,
		}
		const { data:messageDoc, message } = await http.createMessage(payload)
		if(message) return showError(message)

		// console.log(messageDoc)

		// Step-3: Send MessageDoc to other-user: WebSocket + and show in UI
		// io.on('')


		// Step-4: Show Audio in sender: user himself
		elements.createYourAudio(textMessagesContainer, { 
			avatar: logedInUser.avatar,
			audioUrl: dataUrl,
			audioDuration,
			createdAt: messageDoc.createdAt
		})

	} catch (err) {
		showError(err.message)
	}
}

// ----------[ file upload: via webRTC ]----------
attachmentButtonInput.addEventListener('change', async (evt) => {
		console.log('only share large file via WebRTC')

	try {
		const selectedUserListContainer = $('[name=selected-user-list-container]')
		const dataUrl = await readAsDataURL(evt.target.files[0], { type: 'file' })


		// const payload = {
		// 	sender: logedInUser._id,
		// 	receiver: selectedUserListContainer.id,
		// 	message: dataUrl,
		// 	type: 'file'
		// }
		// Don't store file in backend, just transfer via webRTC client <==> client


		// elements.createYourMessage(textMessagesContainer, { 
		// 	type: 'image', 
		// 	message: dataUrl
		// })


		// send this element via wss + webRTC
			// elements.createTheirMessage(textMessagesContainer, { 
			// 	type: 'image', 
			// 	// message: messageDoc.message,
			// 	// avatar: messageDoc.sender.avatar
			// })

	} catch (err) {
		showError(err.message)
	}
})