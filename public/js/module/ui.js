import { Snackbar } from './components/index.js'
import { $, redirectTo, readAsDataURL, followFollowingHandler } from './utils.js'
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
const searchFriendsInput = $('#search-friends')
const searchFriendsModel = $('[name=search-friends-modal]')
const searchPeopleInput = $('#search-people')
const searchPeopleModal = $('[name=search-people-modal]')
const searchMessageInput = $('#search-messages')



let controller = null

const showSearchModal = (modalSelector) => () => {
	if(modalSelector.classList.contains('hidden') ) {
		modalSelector.classList.remove('hidden')
	}
}
const hideSearchModal = (modalSelector) => (evt) => {
	const { left, right, top, bottom } = modalSelector.getBoundingClientRect()

	const leftSide = evt.clientX < left
	const rightSide = evt.clientX > right
	const topSide = evt.clientY < top
	const bottomSide = evt.clientY > bottom

	if(leftSide || rightSide || topSide || bottomSide) {
		modalSelector.classList.add('hidden')
	}
}

const handleModalSearch = (modalSelector) => async (evt) => {
	if(controller) controller.abort()
	controller = new AbortController()
	const { signal } = controller

	const search = evt.target.value

	try {
		const res = await fetch(`/api/users/friends?_search=${search},email,firstName,lastName`, { signal })
		if(!res.ok) throw await res.json()
		const { data: friends } = await res.json()

		modalSelector.innerHTML = '' 	// empty old modal friends before add new friends
		// evt.target.value = '' 							// empty input value after search success

		// console.log(friends)

		friends.forEach( friend => {
			elements.createFirendList(modalSelector, {
				id: friend.id,
				avatar: friend.avatar,
				message: friend.fullName,
				isActive: true,
				isTitle: false,
			})
		})

		// Show searched selected user in the UI as we did with friend list item clicked (selection)
		modalSelector.addEventListener('click', (evt) => {
			const selectedUserId = evt.target.id
			const selectedUser = friends.find( user => user.id === selectedUserId )
			selectedUserHandler(selectedUser)

			modalSelector.classList.add('hidden') 	// hide searched friends modal after select one
			modalSelector.innerHTML = '' 					// Clear search result so that next click on search modal remain empty
		})



	} catch (err) {
		if(err.name === 'AbortError') return 

		showError(err.message)
		evt.target.value = ''
	}
}
// const getChatById = async (chatId) => {
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


const handleListSelection = (friends) => {
	let friendsListItems = friendsListContainer.querySelectorAll('[name=list-container]')
			friendsListItems = Array.from(friendsListItems)

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


// show user in UI based on user document
const selectedUserHandler = (user) => {
	const selectedUserListContainer = $('[name=selected-user-list-container]')
	const avatarImg = selectedUserListContainer.querySelector('[name=avatar]')
	const avatarBadge = selectedUserListContainer.querySelector('[name=avatar-badge]')
	const name = selectedUserListContainer.querySelector('[name=username]')
	
	selectedUserListContainer.id = user.id
	avatarImg.src = user.avatar
	avatarBadge.classList.toggle('active', true) 	// if user active then make true
	name.textContent = user.fullName
	name.href = user.username || user._id

	// // show userId without page refresh: problem require #userId=undefined on page load
	// const url = new URL(location.href)
	// url.hash = `userId=${user.id}`
	// location.href = url
	// console.log(url.hash)

	showAllMessagesInUI(user.id) 				
	leftPannelSlideButtonInputCheckbox.checked = false 	// hide left-panel
}


// add all type of message here
const addMessage = (messageDoc) => {
	if(!messageDoc) return showError('message document is required')

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
}


// hide message in UI for testing video call
const showAllMessagesInUI = async (receiver) => {
	// textMessagesContainer.innerHTML = '' 		// empty container before add new items

	// const payload = {
	// 	sender: logedInUser._id,
	// 	receiver
	// }
	
	// const { data:messages, message:errorMessage } = await http.getAllChatMessages(payload)
	// if(errorMessage) return showError(errorMessage)

	// messages.forEach(messageDoc => {
	// 	// console.log(messageDoc)
	// 	// show error alert for not populated senerio
	// 	addMessage(messageDoc)
	// })
}




export const showError = (message, reason) => {
	console.log(message)
	Snackbar({
		severity: 'error',
		message
	})
}

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
			isActive: friend.isOnline,

			// --- latestMessage 	details
			type: friend.latestMessage?.type,
			message: friend.latestMessage?.message,			
			createdAt: friend.latestMessage?.createdAt, 

			// --- Notification details
			// isNoNotification: true, 			// hide both new notification + success notification
			isNotification: true, 					// for New notification: to work 'isNoNotification' must be false
			notificationValue:  2,
			// isMessageSuccess: true, 				// for seen notification: to work 'isNotification' must be false
		})
	})
	handleListSelection(friends)
}


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


export const filterMessageByAttachmentType = async (type='text') => {
	try {
		const { error, data:messages } = await http.filterAttachments(type)
		if(error) return showError( error )

		textMessagesContainer.innerHTML = '' 		// empty container before add new items

		if(!messages.length) return showError(`no more messages of ${type}`)

		messages.forEach(messageDoc => {
			// console.log(messageDoc)
			// show error alert for not populated senerio
			addMessage(messageDoc)
		})

	} catch (error) {
		const message = error.message || error
		showError(message)
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

	// send the messageDoc via wss to other end to handle and update activeFriendList 
	// friend.latestMessage = message

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


// --- handle in home page: [ drag-and-drop ]
// ----------[ file upload: via webRTC ]----------
// attachmentButtonInput.addEventListener('change', async (evt) => {
// 	const message = 'only share large file via WebRTC'
// 	console.log(message)
// 	showError(message)

// 	try {
// 		const selectedUserListContainer = $('[name=selected-user-list-container]')
// 		const dataUrl = await readAsDataURL(evt.target.files[0], { type: 'file' })


// 		// const payload = {
// 		// 	sender: logedInUser._id,
// 		// 	receiver: selectedUserListContainer.id,
// 		// 	message: dataUrl,
// 		// 	type: 'file'
// 		// }
// 		// Don't store file in backend, just transfer via webRTC client <==> client


// 		// elements.createYourMessage(textMessagesContainer, { 
// 		// 	type: 'image', 
// 		// 	message: dataUrl
// 		// })


// 		// send this element via wss + webRTC
// 			// elements.createTheirMessage(textMessagesContainer, { 
// 			// 	type: 'image', 
// 			// 	// message: messageDoc.message,
// 			// 	// avatar: messageDoc.sender.avatar
// 			// })

// 	} catch (err) {
// 		showError(err.message)
// 	}
// })





//----------[ Search Friends: left-panel ]----------
// Step-1: show modal on input click
searchFriendsInput.addEventListener('click', showSearchModal(searchFriendsModel))
// Step-2: Hide modal when click outside of modal
document.addEventListener('click', hideSearchModal(searchFriendsModel))
// Step-3: Add searched friends and show them in that modal
searchFriendsInput.addEventListener('input', handleModalSearch(searchFriendsModel))





//----------[ Search People: right-panel ]----------
// Step-1: show modal on input click
searchPeopleInput.addEventListener('click', showSearchModal(searchPeopleModal))
// Step-2: Hide modal when click outside of modal
document.addEventListener('click', hideSearchModal(searchPeopleModal))


// Step-3: Add searched friends and show them in that modal
searchPeopleInput.addEventListener('input', async (evt) => {
	if(controller) controller.abort()
	controller = new AbortController()
	const { signal } = controller

	const search = evt.target.value

	try {
		const res = await fetch(`/api/users/?_search=${search},email,firstName,lastName`, { signal })
		// const res = await fetch(`/api/users/`, { signal })
		if(!res.ok) throw await res.json()
		const { data: people } = await res.json()


		searchPeopleModal.innerHTML = '' 	// empty old modal friends before add new friends
		// evt.target.value = '' 							// empty input value after search success





		people 		// people means profileUsers or non-logedInUsers
			.filter(user => user._id != logedInUser._id ) 	// logedInUser globally available
			.forEach( user => {
				elements.createFirendList(searchPeopleModal, {
					id: user.id,
					avatar: user.avatar,
					message: user.fullName,
					isActive: user.isOnline,
					isTitle: false,

					isNoNotification: true,
					showFollowButton: true,
					isFollowing: user.followers.includes( logedInUser._id )
				})
		})

		// Show searched selected user in the UI as we did with friend list item clicked (selection)
		searchPeopleModal.addEventListener('click', async (evt) => {
			// const selectedUser = friends.find( user => user.id === selectedUserId )
			// selectedUserHandler(selectedUser)

			// searchPeopleModal.classList.add('hidden') 	// hide searched friends modal after select one
			// searchPeopleModal.innerHTML = '' 					// Clear search result so that next click on search modal remain empty

			if(evt.target.tagName === 'BUTTON') {
				const container = evt.target.closest('[name=list-container]')

				const { error, data } = await http.toggleFollow(container.id)
				if(error) return showError(error)

				// make current users active style
				followFollowingHandler(evt)


			} else {
				redirectTo(`/profile/${evt.target.id}`)
			}
		})


	} catch (err) {
		if(err.name === 'AbortError') return 

		showError(err.message)
		evt.target.value = ''
	}
})



//----------[ Search messages ]----------
searchMessageInput.addEventListener('input', async (evt) => {
	const selectedUserListContainer = $('[name=selected-user-list-container]')
	const receiver = selectedUserListContainer.id

	const search = evt.target.value

	// if no search value then get users chats as it was before search
	if(!search) return showAllMessagesInUI(receiver)
	

	if(controller) controller.abort() 
	controller = new AbortController()
	const { signal } = controller

	const payload = {
		sender: logedInUser._id,
		receiver,
		_search: `${search},message,type`
	}
	const searchParams = new URLSearchParams(payload)
	const query = searchParams.toString()

	try {
		const res = await fetch(`/api/messages?${query}`, { signal })
		if(!res.ok) throw await res.json()

		const { data: messages } = await res.json()

		textMessagesContainer.innerHTML = '' 		// empty container before add new items

		messages.forEach(messageDoc => {
			// console.log(messageDoc)
			// show error alert for not populated senerio
			addMessage(messageDoc)
		})
	} catch (err) {
		if(err.name === 'AbortError') return 

		showError(err.message)
	}

})



// 1. handle active user based on ?#userId=aksdjfasdjf
// 2. then handle ?#userId=aksdjfasdjf 	comes from /profile page message button click

// trying to handle /profile page message button click redirectTo
document.addEventListener('DOMContentLoaded', async () => {
	const url = new URL(location.href)
	if(!url.hash.startsWith('#userId')) return

	const selectedUserId = url.hash.split('=').pop()
	console.log({ selectedUserId })

	// let friendsListItems = friendsListContainer.querySelectorAll('[name=list-container]')
	// 		friendsListItems = Array.from(friendsListItems)

	// const { data: selectedUser, message } = await http.getSelectedUser(selectedUserId)
	// if(message) showError(message)

	// selectedUserHandler(selectedUser)

	// friendsListItems.forEach( el => {
	// 	el.classList.toggle('selected', el.id === selectedUserId) 
	// })
})


