import { Snackbar } from './components/index.js'
import { $, redirectTo, readAsDataURL, followFollowingHandler } from './utils.js'
import * as elements from '../module/elements.js'
import * as http from './http.js'
import * as wss from './wss.js'
import * as store from './store.js'
import { CALL_STATUS, CALL_TYPE, OFFER_TYPE } from '../module/constants.js'

// const middleTop = $('[name=middle-top]')
// const middleTopAvatar = middleTop.querySelector('[name=avatar]')
// const middleTopUsername = middleTop.querySelector('[name=username]')
// console.log(middleTopAvatar, middleTopUsername)
const leftPanelAvatar = $('[name=left-top] [name=list-container] img')
const leftPannelSlideButtonInputCheckbox = $('#left-side-checkbox')
// const friendsNotFound = $('[name=friends-not-found]') 	
const leftMainContainer = $('[name=left-main]')
const friendsListContainer = $('[name=friends-list-container]') 	
// const messageContainer = $('[name=message-container]') 	
const textMessagesContainer = $('[name=text-message-container]') 			// only override messages not video containers too used for video call

// const attachmentButtonInput = $('#attachment-icon-button')
const sendMessageForm = $('form[name=middle-bottom]')
const writeMessageInput = $('[name=write-message-input]') 	
const cameraIconButtonInput = $('#camera-icon-button')
const searchFriendsInput = $('#search-friends')
const searchFriendsModel = $('[name=search-friends-modal]')
const searchPeopleInput = $('#search-people')
const searchPeopleModal = $('[name=search-people-modal]')
const searchMessageInput = $('#search-messages')

const audioCallButton = $('[name=audio-call-button]') 	
const videoCallButton = $('[name=video-call-button]') 	
const rightSideAudioCallButton = $('[name=right-side] [name=audio-call-button]') 	
const rightSideVideoCallButton = $('[name=right-side] [name=video-call-button]') 	
const messagesContainer = $('[name=message-container]') 	
const callPanel = $('[name=call-panel]') 	

const callPanelMicrophoneButton = $('[name=call-panel] [name=microphone-on-off]') 	
const callPanelCameraButton = $('[name=call-panel] [name=camera-on-off]') 	
const callPanelScreenShareButton = $('[name=call-panel] [name=flip-camera]') 	
const callPanelRecordingButton = $('[name=call-panel] [name=recording]') 	

const recordingPanel = $('[name=recording-panel]') 	
const recordingPanelPlayPauseButton = $('[name=recording-panel] [name=play-pause]') 	
const rightPanelMainBlock = $('[name=right-main]')

let timer = 0
let controller = null







// ----------[ Other user Side ]----------
export const receiveUpdateMessageTypingIndicator = ({ activeUserId }) => {
	const selectedUserListContainer = $('[name=selected-user-list-container]')
	const titleP = selectedUserListContainer.querySelector('[name=title]')

	if(titleP.classList.contains('hidden')) titleP.classList.remove('hidden') 

	clearTimeout(timer)
	timer = setTimeout(() => {
		titleP.classList.add('hidden') 		// hide typing... indicator from top
	}, [1000])
}
export const receiveMessage = ({ type, activeUserId, message }) => {
	// console.log(message)

	// show text or image message
	if(type === 'text' || type === 'image') return elements.createTheirMessage(textMessagesContainer, { 
		type: message.type,
		message: message.message,
		avatar: message.sender.avatar
	})

	// show audio message
	if(type === 'audio') return elements.createTheirAudio(textMessagesContainer, { 
		avatar: message.sender.avatar,
		audioUrl: message.message,
		audioDuration: message.duration,
		createdAt: message.createdAt,
	})

}

// wss.js
export const handlePreOffer = async ({ callerUserId, calleeUserId, callType }) => {
	/* if callStatus busy or calling =>
			1. send pre-offer-answer: { offerType: CALL_UNAVAILABLE }
	*/ 

	const { currentCallStatus } = store.getState()
	if(currentCallStatus === CALL_STATUS.CALL_ENGAGED) {
		console.log('all ready in call engaged')
		return showError('user is already in called')
	}

	const type = callType.toLowerCase().startsWith('audio') ? 'audio' : 'video'


	try {
		const isSucceed = await elements.incommingCallDialog({ type })

		if(isSucceed) {
			wss.sendPreOfferAnswer({ 
				callerUserId,
				calleeUserId,
				offerType: OFFER_TYPE.CALL_ACCEPTED, 
			})
			// if call accepted only then update callee-side: see inside wss.sendPreOfferAnswer function

		} else {
			wss.sendPreOfferAnswer({ 
				callerUserId: calleeUserId,
				calleeUserId: callerUserId,
				offerType: OFFER_TYPE.CALL_REJECTED, 
			})
			hideCallingDialog()
			console.log('rejected')
		}

	} catch (error) {
		wss.sendPreOfferAnswer({ 
			callerUserId: calleeUserId,
			calleeUserId: callerUserId,
			offerType: OFFER_TYPE.CALL_UNAVAILABLE, 
		})
		console.log('handle error: ', error)
	}
}

export const hideCallingDialog = () => {
	const callerCallingDialog = $('[name=calling-dialog]')
	if(callerCallingDialog) callerCallingDialog.remove()
}

export const calleeSideAcceptCallHandler = ({ callerUserId }) => {
	console.log('callee-side: accept call handler')
	hideCallingDialog()
	showVideoContainer()

	/* Step-1: select friend-list based on callerUserId else callee Side close call 
	** will failed because `activeUserId` will not be same as `calleeUserId`
	** which cause the problem.

	** Step-2: if already selected friendlist: then no need extra http request
	*/ 
	const { activeUserId } = store.getState()
	if(activeUserId !== callerUserId ) showSelectedUser(callerUserId) // => selectedUserId
}

// wss.js: on('pre-offer-answer', ...)
export const callerSideAcceptCallHandler = () => {
	console.log('caller-side: accept call handler')
	// 1. hide call dialog from both side
	// 2. tell callStatus busy to others
	// 3. make both side's call button disabled
	// 2. send webRTC connection request

	console.log('accepteCallHandler')
	hideCallingDialog() 		
	showVideoContainer()

	
}

// wss.js: on('pre-offer-answer', ...)
export const callerSideRejectCallHandler = () => {
	// 1. hide call dialog from both side
	// 2. tell callStatus available to everyone
	// 3. make both side's call button enabled
	console.log('caller-side: rejected')
	hideCallingDialog()
	hideVideoContainer()
}

const calleeSideRejectCallHandler = () => {
	console.log('callee-side: rejected')

	const { activeUserId, logedInUserId } = store.getState()
	if(!activeUserId) return showError(`activeUserId error: ${activeUserId}`)

	wss.sendPreOfferAnswer({ 
		callerUserId: logedInUserId,
		calleeUserId: activeUserId, 
		offerType: OFFER_TYPE.CALL_REJECTED, 
	})
	hideCallingDialog() 	// hide others if exists
	showVideoContainer()
}



// home.js: callPanelCallButton()
export const closeCallHandler = () => {
	console.log('stop call')
	const { logedInUserId, activeUserId } = store.getState()

	wss.sendCloseCallSignal({ 
		callerUserId: logedInUserId, 
		calleeUserId: activeUserId, 
		offerType: OFFER_TYPE.CALL_CLOSED 
	})

	// 3. reset callPanel
	resetCallHandler()
	// callPanelMicrophoneButton.classList.remove('called') 		// reset microphone  style
	// callPanelCameraButton.classList.remove('called') 					// reset camera style
	// callPanelScreenShareButton.classList.remove('called') 	// reset screenShare style
	// stopRecordingHandler() 	// reset recording


}
const resetCallHandler = () => {
	audioCallButton.disabled = false
	videoCallButton.disabled = false
	rightSideAudioCallButton.disabled = false
	rightSideVideoCallButton.disabled = false
	// 
}

const stopRecordingHandler = () => {
		console.log('stop recording handler')
	
		// handle close functionality
			// 1. stop webRTC call
			// ...

	callPanelRecordingButton.classList.remove('called') 				// 1. reset active recording button style
	recordingPanel.classList.add('hidden') 											// 2. hide recording panel
	recordingPanelPlayPauseButton.classList.add('called') 			// 3. make recording pause state
}



// wss.js: on('call-status', )
// wss.js: on('pre-offer-answer', )
export const calleeNotFoundHandler = () => {
	// 1. hide call dialog from both side
	// 2. tell callStatus available to everyone
	// 3. make both side's call button enabled

	hideCallingDialog() 							// hide outgoing calling dialog
	elements.calleeNotFoundDialog() 	// show notFound call dialog : which will be closed after 3sec

	// store.setCallStatus('')
	// console.log('re-set callStatus')
}
// wss.js: on('call-status', )
export const calleeBusyHandler = () => {
	hideCallingDialog()
	elements.calleeBusyCallDialog()
}
//----

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
		searchPeopleInput.value = '' 		// reset-searh value on blur
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
		const { data } = await res.json()

		modalSelector.innerHTML = '' 	// empty old modal friends before add new friends
		// evt.target.value = '' 							// empty input value after search success

		const friends = http.addOnlineProperty(data)

		friends.forEach( friend => {
			elements.createFirendList(modalSelector, {
				id: friend.id,
				avatar: friend.avatar,
				message: friend.fullName,
				isActive: friend.isOnline,
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

const showSelectedUser = async (selectedUserId) => {
	let friendsListItems = friendsListContainer.querySelectorAll('[name=list-container]')
			friendsListItems = Array.from(friendsListItems)

	const { data: selectedUser, message } = await http.getSelectedUser(selectedUserId)
	if(message) showError(message)

	selectedUserHandler(selectedUser)

	friendsListItems.forEach( el => {
		el.classList.toggle('selected', el.id === selectedUserId) 
	})
}


const handleListSelection = (friends) => {
	const url = new URL(location.href)

	if(url.hash.startsWith('#userId')) {
		const selectedUserId = url.hash.split('=').pop()
		showSelectedUser(selectedUserId)
	} else {
		selectedUserHandler(friends[0])
	}

	friendsListContainer.addEventListener('click', async (evt) => {
		const selectedUserId = evt.target.id
		showSelectedUser(selectedUserId)
	})
}


// show user in UI based on user document
const selectedUserHandler = (user) => {
	const selectedUserListContainer = $('[name=selected-user-list-container]')
	const avatarImg = selectedUserListContainer.querySelector('[name=avatar]')
	const avatarBadge = selectedUserListContainer.querySelector('[name=avatar-badge]')
	const name = selectedUserListContainer.querySelector('[name=username]')
	
	if(!user._id) return showError(` user._id = ${user._id} error`)
	
	store.setActiveUserId(user._id)
	
	selectedUserListContainer.id = user._id
	avatarImg.src = user.avatar
	avatarBadge.classList.toggle('active', user.isOnline) 	// if user active then make true
	name.textContent = user.fullName
	name.href = `/profile/${user.username || user._id}`

	// show userId without page refresh: problem require #userId=undefined on page load
	const url = new URL(location.href)
	url.hash = `userId=${user._id}`
	location.href = url

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


export const showVideoContainer = () => {
	messagesContainer.classList.add('call') 	 				// show message panel instead of userProfile details
	rightPanelMainBlock.classList.add('active') 			// show videoContainer instead of message container

	// disable audioCallButtons
	audioCallButton.disabled = true 									// disable audioCallButton: in middle-top
	rightSideAudioCallButton.disabled = true 					// disable audioCallButton: in right-main

	// disable videoCallButtons
	videoCallButton.disabled = true										// disable videoCallButton: in middle-top
	rightSideVideoCallButton.disabled = true 					// disable videoCallButton: in right-main
}
export const hideVideoContainer = () => {
	messagesContainer.classList.remove('call') 	 			// hide message panel, show userProfile details back
	rightPanelMainBlock.classList.remove('active') 		// hide videoContainer, and show message container back

	// enable audioCallButton
	audioCallButton.disabled = false 									// enable audioCallButton: in middle-top
	rightSideAudioCallButton.disabled = false 				// enable audioCallButton: in right-main

	// enable videoCallButtons
	videoCallButton.disabled = false									// enable videoCallButton: in middle-top
	rightSideVideoCallButton.disabled = false 				// enable videoCallButton: in right-main
}
// const showRightMessagePanel = () => {
// 	rightPanelMainBlock.classList.add('active') 		
// }
// export const hideRightMessagePanel = () => {
// 	rightPanelMainBlock.classList.remove('active') 		
// }




export const showError = (message, reason) => {
	console.log(message)
	Snackbar({
		severity: 'error',
		message
	})
}

export const showFriendsNotFoundUI = () => leftMainContainer.classList.remove('active')
export const showFriendsListContainerUI = () => leftMainContainer.classList.add('active')
	


// wss.js => const registerSocketEvents = () => {...}
export const showFriendLists = (friends=[]) => {
	friendsListContainer.innerHTML = ''

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
		const activeUserId = selectedUserListContainer.id
		const payload = {
			sender: logedInUser._id,
			receiver: activeUserId,
			message: dataUrl,
			type: 'audio',
			duration: audioDuration,
		}
		const { data:messageDoc, message } = await http.createMessage(payload)
		if(message) return showError(message)


		// Step-3: Send MessageDoc to other-user: WebSocket + and show in UI
		wss.sendMessage({ type: 'audio', activeUserId, message: messageDoc })

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


// home.js: [ right-side: attachment ]
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


// ----------[ call ]----------

export const callerSideBusyCallHandler = () => {
	hideCallingDialog()
	elements.calleeBusyCallDialog()
}

// force user to stop audio call if already in video call 
export const audioCallHandler = async () => {
	if(videoCallButton.disabled || rightSideVideoCallButton.disabled) {
		showError('Your video call must be terminate first')
		return
	}


	const { activeUserId, logedInUserId } = store.getState()
	if(!activeUserId) return showError(`activeUserId error: ${activeUserId}`)


	const isCalling = wss.currentCallStatus === CALL_STATUS.CALLING 
	const isEngaged = wss.currentCallStatus === CALL_STATUS.CALL_ENGAGED
	const isAvailable = wss.currentCallStatus === CALL_STATUS.CALL_AVAILABLE 

	if( isCalling || isEngaged) return


	if( isAvailable ) {
		wss.sendPreOffer({ 
			callerUserId: logedInUserId,
			calleeUserId: activeUserId, 
			callType: CALL_TYPE.AUDIO_CALL, 
		})

		const isSuccess = await elements.outGoingCallDialog()
		if(!isSuccess) calleeSideRejectCallHandler()
	}

	// audioCallButton.disabled = true
	// rightSideAudioCallButton.disabled = true
	// closeCallHandler() 																// 1. close previous call style 

	// messagesContainer.classList.add('call') 				// show video-container and hide message container
	// callPanel.classList.add('audio') 									// 4. only show 3rd call button, others will be hidden
}


export const videoCallHandler = async () => {
	if(audioCallButton.disabled || rightSideAudioCallButton.disabled) {
		showError('Your audio call must be terminate first')
		return
	}

	const { activeUserId, logedInUserId } = store.getState()
	if(!activeUserId) return showError(`activeUserId error: ${activeUserId}`)

	if( wss.currentCallStatus === CALL_STATUS.CALL_AVAILABLE ) {

		wss.sendPreOffer({ 
			callerUserId: logedInUserId,
			calleeUserId: activeUserId, 
			callType: CALL_TYPE.VIDEO_CALL, 
		})

		const isSuccess = await elements.outGoingCallDialog()
		if(!isSuccess) {
			hideCallingDialog() 	// hide others if exists
			wss.sendPreOfferAnswer({ 
				callerUserId: logedInUserId,
				calleeUserId: activeUserId, 
				offerType: OFFER_TYPE.CALL_REJECTED, 
			})

			showVideoContainer()
		}
	}


	if( wss.currentCallStatus === CALL_STATUS.CALL_BUSY ) {
		const { rooms, activeUserId } = store.getState()
		const isUserActive = rooms.find( room => room.userId === activeUserId )

		if(isUserActive) calleeBusyHandler()
		else calleeNotFoundHandler()
	}


	// videoCallButton.disabled = true
	// rightSideVideoCallButton.disabled = true
	// closeCallHandler() 																// 1. close previous call style 

	// messagesContainer.classList.add('call') 				// show video-container and hide message container
	// callPanel.classList.remove('audio') 							// 4. make video call
}





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


// ----------[ send message: text + emoji ]----------
// Step-1: Show typing indicator in self UI
writeMessageInput.addEventListener('input', () => {
	const selectedUserListContainer = $('[name=selected-user-list-container]')
	const titleP = selectedUserListContainer.querySelector('[name=title]')
	const activeUserId = selectedUserListContainer.id

	if(titleP.classList.contains('hidden')) titleP.classList.remove('hidden') 
	wss.sendMessageTypingIndicator({ activeUserId })
	
	clearTimeout(timer)
	timer = setTimeout(() => {
		titleP.classList.add('hidden') 		// hide typing... indicator from top
	}, [1000])
})
sendMessageForm.addEventListener('submit', async (evt) => {
	evt.preventDefault()

	const selectedUserListContainer = $('[name=selected-user-list-container]')
	const activeUserId = selectedUserListContainer.id

	const payload = {
		sender: logedInUser._id,
		receiver: activeUserId,
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

	wss.sendMessage({ type: 'text', activeUserId, message: messageDoc })
	// send the messageDoc via wss to other end to handle and update activeFriendList 
	// friend.latestMessage = message

})


// ----------[ send message: image ]----------
// Step-1: Show typing indicator in self UI
cameraIconButtonInput.addEventListener('change', async (evt) => {
	try {
		const selectedUserListContainer = $('[name=selected-user-list-container]')
		const dataUrl = await readAsDataURL(evt.target.files[0])
		const activeUserId = selectedUserListContainer.id

		const payload = {
			sender: logedInUser._id,
			receiver: activeUserId,
			message: dataUrl,
			type: 'image'
		}
		const { data:messageDoc, message } = await http.createMessage(payload)
		if(message) return showError(message)

		// console.log(messageDoc)

		elements.createYourMessage(textMessagesContainer, { 
			type: 'image', 
			message: messageDoc.message,
		})

		// send this element via wss
		wss.sendMessage({ type: 'image', activeUserId, message: messageDoc })

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
		const { data } = await res.json()

		const people = http.addOnlineProperty(data)

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




