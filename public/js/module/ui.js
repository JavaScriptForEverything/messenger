import { Snackbar } from './components/index.js'
import { $, showError, redirectTo, readAsDataURL, followFollowingHandler, stringToElement } from './utils.js'
import * as elements from '../module/elements.js'
import * as http from './http.js'
import * as wss from './wss.js'
import * as webRTC from './webRTC.js'
import * as store from './store.js'
import { CALL_STATUS, CALL_TYPE, OFFER_TYPE } from '../module/constants.js'

const leftPanelAvatar = $('[name=left-top] [name=list-container] img')
const leftPannelSlideButtonInputCheckbox = $('#left-side-checkbox')
const leftMainContainer = $('[name=left-main]')
const friendsListContainer = $('[name=friends-list-container]') 	
const middleMainContainer = $('[name=middle-main]')
const chatContainer = $('[name=chat-container]') 	

const sendMessageForm = $('form[name=middle-bottom]')
const writeMessageInput = $('[name=write-message-input]') 	
const cameraIconButtonInput = $('#camera-icon-button')
const searchFriendsInput = $('#search-friends')
const searchFriendsModel = $('[name=search-friends-modal]')
const searchPeopleInput = $('#search-people')
const searchPeopleModal = $('[name=search-people-modal]')
const searchMessageInput = $('#search-messages')

const yourVideo = $('[name=your-video')
const theirVideo = $('[name=their-video')
const audioCallButton = $('[name=audio-call-button]') 	
const videoCallButton = $('[name=video-call-button]') 	
const rightSideAudioCallButton = $('[name=right-side] [name=audio-call-button]') 	
const rightSideVideoCallButton = $('[name=right-side] [name=video-call-button]') 	
const messagesContainer = $('[name=message-container]') 	
const callPanel = $('[name=call-panel]') 	

const callPanelRecordingButton = $('[name=call-panel] [name=recording]') 	
const callPanelMicrophoneButton = $('[name=call-panel] [name=microphone-on-off]') 	
const callPanelCameraButton = $('[name=call-panel] [name=camera-on-off]') 	

const recordingPanel = $('[name=recording-panel]') 	
const recordingPanelPlayPauseButton = $('[name=recording-panel] [name=play-pause]') 	
const rightPanelMainBlock = $('[name=right-main]')
const dragAndDropPanel = $('[name=drag-and-drop-panel]')
const dragAndDropDownloadingIndicator = $('[name=drag-and-drop-downloading-indicator]')
const showDownloadParcentageEl = $('[name=show-download-parcentage-value]')

let timer = 0
let controller = null



// webRTC: createPeerConnection()
export const resetCallMute = () => {
	if(callPanelMicrophoneButton.classList.contains('called')) {
		callPanelMicrophoneButton.classList.remove('called')
	} 
}
// webRTC: createPeerConnection()
export const resetCallCamera = () => {
	if(callPanelCameraButton.classList.contains('called')) {
		callPanelCameraButton.classList.remove('called')
	} 
}



export const turnOffWebCam = () => {
	const { localStream } = store.getState()
	localStream?.getTracks().forEach( track => track.stop()) 	// turn off WebCam
}

// ----------[ Other user Side ]----------
// wss.js: socket.on('message', () => {...})
export const receiveUpdateMessageTypingIndicator = ({ callerUserId, calleeUserId }) => {
	const selectedUserListContainer = $('[name=selected-user-list-container]')
	const titleP = selectedUserListContainer.querySelector('[name=title]')

	const { activeUserId } = store.getState()
	if( callerUserId !== activeUserId ) return

	if(titleP.classList.contains('hidden')) titleP.classList.remove('hidden') 

	clearTimeout(timer)
	timer = setTimeout(() => {
		titleP.classList.add('hidden') 		// hide typing... indicator from top
	}, [1000])
}


// wss.js: socket.on('message', ({ ... }) => {})
export const receiveMessage = ({ callerUserId, calleeUserId, message, type }) => {

	// Step-2: Update firendList subtile with message type:
	console.log('update friendList label with ', { type })

	/* Step-3: Update UI
			. if( callerUserId === activeUserId )  that means selectedUser then add message in messageContainer
			. else add message notification counts in callee-side left-panel: targeted friend list
	*/ 
	// Step-3: add message in UI
	const { activeUserId } = store.getState()
	if( callerUserId !== activeUserId ) { 		// then only callee-side add notification label
		

		console.log('update callee-side')
		return 	// don't let go to add message in UI
	}

	// Step-4: add messages in UI: text or image 
	if(type === 'text' || type === 'image') {
		// one for middle block
		console.log({ messageId: message.id })
		elements.createTheirMessage(messagesContainer, { 
			id: message._id,
			type: message.type,
			message: message.message,
			avatar: message.sender.avatar,

			onClose: ({ target }) => {
				console.log(target)
				target.remove()
			}
		})
		// one for right block
		elements.createTheirMessage(chatContainer, { 
			id: message._id,
			type: message.type,
			message: message.message,
			avatar: message.sender.avatar
		})
		return 
	}

	// show audio message
	if(type === 'audio') {
		elements.createTheirAudio(messagesContainer, { 
			id: message._id,
			avatar: message.sender.avatar,
			audioUrl: message.message,
			audioDuration: message.duration,
			createdAt: message.createdAt,
		})
		elements.createTheirAudio(chatContainer, { 
			id: message._id,
			avatar: message.sender.avatar,
			audioUrl: message.message,
			audioDuration: message.duration,
			createdAt: message.createdAt,
		})
		return 
	}


	/* Step-last: Add incomming-message-sound: add to very end, because
	** 	. if sound not play because of browser restriction then don't block other codes
	*/ 
	const audio = document.createElement('audio')
	audio.src = '/music/message/tab-tone.mp3'
	audio.play()
}

// wss.js
export const handlePreOffer = async ({ callerUserId, calleeUserId, callType }) => {
	/* if callStatus busy or calling =>
			1. send pre-offer-answer: { offerType: CALL_UNAVAILABLE }
	*/ 

	const { currentCallStatus } = store.getState()
	if(currentCallStatus === CALL_STATUS.CALL_ENGAGED) {
		// console.log('all ready in call engaged')
		return showError('user is already in called')
	}

	const type = callType.toLowerCase().startsWith('audio') ? 'audio' : 'video'


	try {
		// console.log('callee-side: 2')
		webRTC.getLocalPreview() 		// callee-side
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
			turnOffWebCam()
		}

	} catch (error) {
		wss.sendPreOfferAnswer({ 
			callerUserId: calleeUserId,
			calleeUserId: callerUserId,
			offerType: OFFER_TYPE.CALL_UNAVAILABLE, 
		})
		// console.log('handle error: ', error)
	}
}

export const hideCallingDialog = () => {
	const callerCallingDialog = $('[name=calling-dialog]')
	if(callerCallingDialog) callerCallingDialog.remove()
}

// webRTC.js: connectionstatechange event handler
export const previewVideo = () => {
	// only preview when peer connection established
	hideCallingDialog()
	showVideoContainer()
}

export const calleeSideAcceptCallHandler = ({ callerUserId }) => {
	// console.log('callee-side: accept call handler')
	/* Step-1: select friend-list based on callerUserId else callee Side close call 
	** will failed because `activeUserId` will not be same as `calleeUserId`
	** which cause the problem.

	** Step-2: if already selected friendlist: then no need extra http request
	*/ 
	const { activeUserId } = store.getState()
	if(activeUserId !== callerUserId ) showSelectedUser(callerUserId) // => selectedUserId

	webRTC.createPeerConnection()
}

// wss.js: on('pre-offer-answer', ...)
export const callerSideAcceptCallHandler = () => {
	// console.log('caller-side: accept call handler')
	// 1. hide call dialog from both side
	// 2. tell callStatus busy to others
	// 3. make both side's call button disabled
	// 2. send webRTC connection request



	webRTC.createPeerConnection()
	webRTC.sendWebRTCOffer() // WebRTC
}

// wss.js: on('pre-offer-answer', ...)
export const callerSideRejectCallHandler = () => {
	// 1. hide call dialog from both side
	// 2. tell callStatus available to everyone
	// 3. make both side's call button enabled
	// console.log('caller-side: rejected')
	hideCallingDialog()
	hideVideoContainer()
	turnOffWebCam()
}

const calleeSideRejectCallHandler = () => {
	// console.log('callee-side: rejected')

	const { activeUserId, logedInUserId } = store.getState()
	if(!activeUserId) return showError(`activeUserId error: ${activeUserId}`)

	wss.sendPreOfferAnswer({ 
		callerUserId: logedInUserId,
		calleeUserId: activeUserId, 
		offerType: OFFER_TYPE.CALL_REJECTED, 
	})
	// hideCallingDialog() 	// hide others if exists
	// showVideoContainer()
	previewVideo()
}



// home.js: callPanelCallButton()
export const closeCallHandler = () => {
	// console.log('stop call')
	const { logedInUserId, activeUserId, localStream } = store.getState()

	wss.sendCloseCallSignal({ 
		callerUserId: logedInUserId, 
		calleeUserId: activeUserId, 
		offerType: OFFER_TYPE.CALL_CLOSED 
	})

	// 3. reset callPanel
	resetCallHandler() 								// Reset UI
	// callPanelMicrophoneButton.classList.remove('called') 		// reset microphone  style
	// callPanelCameraButton.classList.remove('called') 					// reset camera style
	// callPanelScreenShareButton.classList.remove('called') 	// reset screenShare style
	stopCallRecordingHandler() 	// reset recording


}
const resetCallHandler = () => {
	audioCallButton.disabled = false
	videoCallButton.disabled = false
	rightSideAudioCallButton.disabled = false
	rightSideVideoCallButton.disabled = false
	// 
}

// ----------[ Call Recording ]----------
const stream = new MediaStream()
let callRecorder = new MediaRecorder(stream) 	// instead of null, put empty stream, for code completion
let audioExt = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'webm' : 'webm'
let chunks = []

// home.js: callPanelRecordingButton.addEventListener('click', (evt) => {...})
export const startCallRecording = () => {
	const { localStream, screenShareStream } = store.getState()
	if(!localStream) return showError(`webcam not active: because localStream is empty`)

	const recorderOptions = {
		mimetype: `video/${audioExt};codecs=vp9,opus` 
	}
	
	const activeStream = screenShareStream ? screenShareStream : localStream
	callRecorder = new MediaRecorder(activeStream, recorderOptions)
	callRecorder.start()

	callRecorder.addEventListener('dataavailable', (evt) => {
		chunks.push( evt.data )

		// handle: stopRecording : trigger after `callRecorder.stop()` invoked
		if( callRecorder.state === 'inactive' ) {
			const blob = new Blob(chunks, { type: `video/${audioExt}` })
			chunks = []

			// Step-? : make downloading file
			const dataUrl = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = dataUrl
			a.download = `video.${audioExt}`
			a.style.display = 'none'

			document.body.appendChild(a)
			a.click()

			setTimeout(() => {
				document.body.removeChild(a)
				URL.revokeObjectURL(dataUrl)
			}, 100)

			// Step-? : reset active state of call Recording UI
			stopCallRecordingHandler() 	
		}
	})
}


// home.js: callPanelRecordingButton.addEventListener('click', (evt) => {...})
// home.js: recordingPanelStopRecordingButton.addEventListener('click', ui.stopCallRecordingHandler)
// ui.js: closeCallHandler
// ui.js: hideVideoContainer = () => {...}
export const stopCallRecordingHandler = () => {
		// console.log('stop recording handler')
	callPanelRecordingButton.classList.remove('called') 				// 1. reset active recording button style
	recordingPanel.classList.add('hidden') 											// 2. hide recording panel
	recordingPanelPlayPauseButton.classList.add('called') 			// 3. make recording pause state

	if(!callRecorder) return
	const isRecording = callRecorder.state === 'recording'
	const isPaused = callRecorder.state === 'paused'
	if( isRecording || isPaused ) callRecorder.stop() 					// 4. Stop MediaRecorder to fire save call
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
		searchFriendsInput.value = '' 		// reset-searh value on blur
		searchPeopleInput.value = '' 			// reset-searh value on blur
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
	
	if(!user) {
		showFriendsNotFoundUI()
		// showError(` user._id = ${user?._id} error`)
		return 
	}
	
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


	// // Step-?: Remove notification label
	// const notificationEl = selectedUserListContainer.querySelector('[name=notification-value]')
	// console.log( selectedUserListContainer )
	// console.log( notificationEl)

	// if(!notificationEl) return 
	// notificationEl.textContent = ''
	// // notificationEl.classList.add('hidden')
	console.log('remove notification if exists: by sending PATCH request to server')
}


// add all type of message here
const addMessage = (messageDoc) => {
	if(!messageDoc) return showError('message document is required')

	if(messageDoc.sender.id === logedInUser._id) {

		if(messageDoc.type === 'audio') {
			elements.createYourAudio(messagesContainer, { 
				id: messageDoc._id,
				avatar: logedInUser.avatar,
				audioUrl: messageDoc.message,
				audioDuration: messageDoc.duration,
				createdAt: messageDoc.createdAt
			})

			elements.createYourAudio(chatContainer, { 
				id: messageDoc._id,
				avatar: logedInUser.avatar,
				audioUrl: messageDoc.message,
				audioDuration: messageDoc.duration,
				createdAt: messageDoc.createdAt
			})

		} else {
			elements.createYourMessage(messagesContainer, { 
				id: messageDoc._id,
				type: messageDoc.type,
				message: messageDoc.message 
			})
			elements.createYourMessage(chatContainer, { 
				id: messageDoc._id,
				type: messageDoc.type,
				message: messageDoc.message 
			})
		}


	} else {
		if(messageDoc.type === 'audio') {
			elements.createTheirAudio(messagesContainer, { 
				id: messageDoc._id,
				avatar: logedInUser.avatar,
				audioUrl: messageDoc.message,
				audioDuration: messageDoc.duration,
				createdAt: messageDoc.createdAt
			})
			elements.createTheirAudio(chatContainer, { 
				id: messageDoc._id,
				avatar: logedInUser.avatar,
				audioUrl: messageDoc.message,
				audioDuration: messageDoc.duration,
				createdAt: messageDoc.createdAt
			})

		} else {
			elements.createTheirMessage(messagesContainer, { 
				id: messageDoc._id,
				type: messageDoc.type,
				message: messageDoc.message,
				avatar: messageDoc.sender.avatar
			})
			elements.createTheirMessage(chatContainer, { 
				id: messageDoc._id,
				type: messageDoc.type,
				message: messageDoc.message,
				avatar: messageDoc.sender.avatar
			})
		}

	}
}


// hide message in UI for testing video call
const showAllMessagesInUI = async (receiver) => {
	messagesContainer.innerHTML = '' 		// empty container before add new items
	chatContainer.innerHTML = '' 				// do same thing with messageContainer

	const payload = {
		sender: logedInUser._id,
		receiver
	}
	
	const { data:messages, message:errorMessage } = await http.getAllChatMessages(payload)
	if(errorMessage) return showError(errorMessage)

	messages.forEach(messageDoc => {
		// console.log(messageDoc)
		// show error alert for not populated senerio
		addMessage(messageDoc)
	})
}



// => showVideoContainer()
export const activeDragAndDropFileSharing = () => {
	dragAndDropPanel.classList.remove('disabled')
}
// activeDragAndDropFileSharing()
// => hideVideoContainer()
export const disableDragAndDropFileSharing = () => {
	dragAndDropPanel.classList.add('disabled')
}



// Caller-Side: home.js: showDragItemsInUI = (fileArray) => {}
export const addDragAndDropUploadingIndicator = () => {
	if( !dragAndDropDownloadingIndicator.classList.contains('active') ) {
		dragAndDropDownloadingIndicator.classList.add('active')	
		dragAndDropDownloadingIndicator.classList.add('upload')	
	}
}
// Caller-Side: home.js: showDragItemsInUI = (fileArray) => {}
export const removeDragAndDropUploadingIndicator = () => {
	if( dragAndDropDownloadingIndicator.classList.contains('active') ) {
		dragAndDropDownloadingIndicator.classList.remove('active')	
		dragAndDropDownloadingIndicator.classList.remove('upload')	
	}
}




// Callee-Side: webRTC.js: peerConnection.addEventListener('datachannel', {...})
export const addDragAndDropDownloadingIndicator = (parcentageValue) => {
	if( !dragAndDropDownloadingIndicator.classList.contains('active') ) {
		dragAndDropDownloadingIndicator.classList.add('active')	
		dragAndDropDownloadingIndicator.classList.add('download')	
	}

	showDownloadParcentageEl.textContent = `${parcentageValue.toFixed()}%`
}
// Callee-Side: webRTC.js: peerConnection.addEventListener('datachannel', {...})
export const removeDragAndDropDownloadingIndicator = () => {
	if( dragAndDropDownloadingIndicator.classList.contains('active') ) {
		dragAndDropDownloadingIndicator.classList.remove('active')	
		dragAndDropDownloadingIndicator.classList.remove('dialog')	
	}

}




export const showVideoContainer = () => {
	middleMainContainer.classList.add('call') 	 			// show videoContainer on top of messageContainer
	rightPanelMainBlock.classList.add('active') 			// show messageContainer in right panel, instead of user Profile details

	// disable audioCallButtons
	audioCallButton.disabled = true 									// disable audioCallButton: in middle-top
	rightSideAudioCallButton.disabled = true 					// disable audioCallButton: in right-main

	// disable videoCallButtons
	videoCallButton.disabled = true										// disable videoCallButton: in middle-top
	rightSideVideoCallButton.disabled = true 					// disable videoCallButton: in right-main

	const { callType } = store.getState()
	callPanel.classList.toggle('audio', callType !== CALL_TYPE.VIDEO_CALL) 		// 4. only show 3rd call button, others will be hidden

}
export const hideVideoContainer = () => {
	middleMainContainer.classList.remove('call') 	 		// hide videoContainer only show messageContainer
	rightPanelMainBlock.classList.remove('active') 		// hide messageContainer in right panel, and show user Profile details back

	// enable audioCallButton
	audioCallButton.disabled = false 									// enable audioCallButton: in middle-top
	rightSideAudioCallButton.disabled = false 				// enable audioCallButton: in right-main

	// enable videoCallButtons
	videoCallButton.disabled = false									// enable videoCallButton: in middle-top
	rightSideVideoCallButton.disabled = false 				// enable videoCallButton: in right-main

	// Reset call recordingPanel active state
	stopCallRecordingHandler() 												// 

}


// export const showError = (message, reason) => {
// 	// console.log(message)
// 	Snackbar({
// 		severity: 'error',
// 		message
// 	})
// }

// => selectedUserHandler()
// => showFriendLists()
// => wss.on('user-join', {...})
export const showFriendsNotFoundUI = () => {
	if(leftMainContainer.classList.contains('active')) {
		leftMainContainer.classList.remove('active')
	}
}
export const showFriendsListContainerUI = () => {
	if(!leftMainContainer.classList.contains('active')) {
		leftMainContainer.classList.add('active')
	}
}
	


// wss.js => const registerSocketEvents = () => {...}
// export const showFriendLists = (friends=[]) => {
export const showFriendLists = (friends=[]) => {
	friendsListContainer.innerHTML = ''
	if(!friends.length) return showFriendsNotFoundUI()

	friends.forEach((friend) => {
		store.setActiveFriend(friend)

		// friend.notifications.map( notification => {
		// 	// if( friend.id === notification.userTo.id ) {
		// 	// 	console.log( friend.id === notification.userTo.id)
		// 	// }
		// 		console.log( friend.id === notification.userFrom.id)

		// 	// console.log({ 
		// 	// 	friendId: friend.id, 
		// 	// 	userTo: notification.userTo.id,
		// 	// 	userFrom: notification.userFrom.id,
		// 	// })
		// })

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
			// isNotification: !!friend.notifications.length, 					// for New notification: to work 'isNoNotification' must be false
			// notificationValue: friend.notifications.length,
			// isMessageSuccess: true, 				// for seen notification: to work 'isNotification' must be false
		})


	})
	handleListSelection(friends)
}

// wss.js: sendMessage()
export const updateSelectedUserMessageLabel = (message) => {
	const { friends, activeUserId } = store.getState()

	const friendsList = Array.from(friendsListContainer.children)
	const activeFriendEl = friendsList.find( friend => friend.id === activeUserId )
	if(!activeFriendEl) return console.log('update active user label failed')

	const friend = friends.find(friend => friend.id === activeUserId )
	if(!friend) return showError('can not find activeUser: UI update failed')

	// Step-1: create new list element
	const currentListEl = elements.createFirendList(null, {
		// --- user details
		id: friend.id,
		avatar: friend.avatar,
		name: friend.fullName,
		isActive: friend.isOnline,

		// --- latestMessage 	details
		type: message?.type,
		message: message?.message,			
		createdAt: message?.createdAt, 

		// --- Notification details
		// isNoNotification: true, 			// hide both new notification + success notification
		// isNotification: true, 					// for New notification: to work 'isNoNotification' must be false
		// notificationValue:  2,
		// isMessageSuccess: true, 				// for seen notification: to work 'isNotification' must be false
	})

	// Step-2: Replace current listItem with newly created one 
	currentListEl.classList.add('selected') 	// make selected backgroun-color
	friendsListContainer.replaceChild(currentListEl, activeFriendEl)
}

// => wss.js: handleSendMessage()
export const updateNonSelectedUserNotificationLabel = ({ callerUserId, message }) => {
	const { friends, activeUserId } = store.getState()

	if(activeUserId === callerUserId) return console.log('dont update selectedUser notification label')

	const friendsList = Array.from(friendsListContainer.children)
	const targetFriendEl = friendsList.find( friend => friend.id === callerUserId )
	const notificationEl = targetFriendEl.querySelector('[name=notification-value]')
	if(!notificationEl) return 

	console.log('await Notification.create() to create notification then update UI too')
	// const notificationValue = Notification.find({ visited: false }).length
	const notificationValue = +notificationEl.textContent  // use above one not this hack

	const friend = friends.find(friend => friend.id === callerUserId )
	if(!friend) return showError('can not find callerUser: UI update failed')

	// Step-1: create new list element
	const currentListEl = elements.createFirendList(null, {
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
		notificationValue:  notificationValue + 1
		// isMessageSuccess: true, 				// for seen notification: to work 'isNotification' must be false
	})

	// // Step-2: Replace current listItem with newly created one 
	// currentListEl.classList.add('selected') 	// make selected backgroun-color
	// friendsListContainer.replaceChild(currentListEl, targetFriendEl)
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
		// const selectedUserListContainer = $('[name=selected-user-list-container]')
		// const activeUserId = selectedUserListContainer.id
		const { activeUserId, logedInUserId } = store.getState()

		const payload = {
			// sender: logedInUser._id,
			sender: logedInUserId,
			receiver: activeUserId,
			message: dataUrl,
			type: 'audio',
			duration: audioDuration,
		}
		const { data:message, message:error } = await http.createMessage(payload)
		if(error) return showError(error)

		// const { data:{ message, notification }, message:error } = await http.createMessage(payload)
		// console.log(message, notification)

		// Step-3: Send MessageDoc to other-user: WebSocket + and show in UI
		wss.sendMessage({ 
			type: 'audio', 
			callerUserId: logedInUserId,
			calleeUserId: activeUserId, 
			message,
		})

		// Step-4: Show Audio in sender: user himself
		elements.createYourAudio(messagesContainer, { 
			id: message._id,
			avatar: logedInUser.avatar,
			audioUrl: dataUrl,
			audioDuration,
			createdAt: message.createdAt
		})
		elements.createYourAudio(chatContainer, { 
			id: message._id,
			avatar: logedInUser.avatar,
			audioUrl: dataUrl,
			audioDuration,
			createdAt: message.createdAt
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

		messagesContainer.innerHTML = '' 		// empty container before add new items
		chatContainer.innerHTML = '' 		// empty container before add new items

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

/* home.js: 
		audioCallButton.addEventListener('click', (evt) => {...})
		rightSideAudioCallButton.addEventListener('click', (evt) => {...})

	- force user to stop audio call if already in video call 
*/
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
		const callType = CALL_TYPE.AUDIO_CALL 
		store.setCallType(callType)

		try {
			webRTC.getLocalPreview() 		// caller-side: audio-call
			// console.log('caller-side: 1')

			wss.sendPreOffer({ 
				callerUserId: logedInUserId,
				calleeUserId: activeUserId, 
				callType
			})

			const isSuccess = await elements.outGoingCallDialog()
			if(!isSuccess) calleeSideRejectCallHandler()


		} catch (err) {
			showError(err.message)
		}
	}
}


/* home.js: 
		videoCallButton.addEventListener('click', (evt) => {...})
		rightSideVideoCallButton.addEventListener('click', (evt) => {...})

	- force user to stop audio call if already in video call 
*/
export const videoCallHandler = async () => {
	if(audioCallButton.disabled || rightSideAudioCallButton.disabled) {
		showError('Your audio call must be terminate first')
		return
	}

	const { activeUserId, logedInUserId } = store.getState()
	if(!activeUserId) return showError(`activeUserId error: ${activeUserId}`)

	const isCalling = wss.currentCallStatus === CALL_STATUS.CALLING 
	const isEngaged = wss.currentCallStatus === CALL_STATUS.CALL_ENGAGED
	const isAvailable = wss.currentCallStatus === CALL_STATUS.CALL_AVAILABLE 
	if( isCalling || isEngaged) return

	if( isAvailable) {
		const callType = CALL_TYPE.VIDEO_CALL
		store.setCallType(callType)


		try {
			// console.log('caller-side: step-1')
			webRTC.getLocalPreview() 		// callee-side

			wss.sendPreOffer({ 
				callerUserId: logedInUserId,
				calleeUserId: activeUserId, 
				callType
			})

			const isSuccess = await elements.outGoingCallDialog()
			if( !isSuccess ) calleeSideRejectCallHandler()


		} catch (err) {
			showError(err.message)	
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




// ----------[ Logout ]----------
leftPanelAvatar.style.cursor = 'pointer'
leftPanelAvatar.addEventListener('click', async (evt) => {
	const { status, message } = await http.logout()
	if(status === 'success') return redirectTo('/login')
	
	showError(message)
})


// ----------[ send message: text + emoji ]----------
// Step-1: Show typing indicator in self UI
writeMessageInput.addEventListener('input', () => {
	const selectedUserListContainer = $('[name=selected-user-list-container]')
	const titleP = selectedUserListContainer.querySelector('[name=title]')
	// const activeUserId = selectedUserListContainer.id

	const { activeUserId, logedInUserId } = store.getState()

	if(titleP.classList.contains('hidden')) titleP.classList.remove('hidden') 
	wss.sendMessageTypingIndicator({ 
		callerUserId: logedInUserId,
		calleeUserId: activeUserId 
	})
	
	clearTimeout(timer)
	timer = setTimeout(() => {
		titleP.classList.add('hidden') 		// hide typing... indicator from top
	}, [1000])
})
sendMessageForm.addEventListener('submit', async (evt) => {
	evt.preventDefault()

	// const selectedUserListContainer = $('[name=selected-user-list-container]')
	// const activeUserId = selectedUserListContainer.id
	const { logedInUserId, activeUserId } = store.getState()

	const payload = {
		// sender: logedInUser._id,
		sender: logedInUserId,
		receiver: activeUserId,
		message: writeMessageInput.value,
		type: 'text',
	}

	const { data:messageDoc, message } = await http.createMessage(payload)
	if(message) return showError(message)

	elements.createYourMessage(messagesContainer, { 
		id: messageDoc._id,
		type: messageDoc.type, 
		message: messageDoc.message
	})
	elements.createYourMessage(chatContainer, { 
		id: messageDoc._id,
		type: messageDoc.type, 
		message: messageDoc.message
	})
	writeMessageInput.value = '' 	// reset

	// wss.sendMessage({ type: 'text', activeUserId, message: messageDoc })
	wss.sendMessage({ 
		type: 'text', 
		callerUserId: logedInUserId,
		calleeUserId: activeUserId, 
		message: messageDoc 
	})

})


// ----------[ send message: image ]----------
// Step-1: Show typing indicator in self UI
cameraIconButtonInput.addEventListener('change', async (evt) => {
	try {
		const dataUrl = await readAsDataURL(evt.target.files[0])
		// const selectedUserListContainer = $('[name=selected-user-list-container]')
		// const activeUserId = selectedUserListContainer.id

		const { logedInUserId, activeUserId } = store.getState()

		const payload = {
			// sender: logedInUser._id,
			sender: logedInUserId,
			receiver: activeUserId,
			message: dataUrl,
			type: 'image'
		}
		const { data:messageDoc, message } = await http.createMessage(payload)
		if(message) return showError(message)

		// console.log(messageDoc)

		elements.createYourMessage(messagesContainer, { 
			id: messageDoc._id,
			type: 'image', 
			message: messageDoc.message,
		})
		elements.createYourMessage(chatContainer, { 
			id: messageDoc._id,
			type: 'image', 
			message: messageDoc.message,
		})

		// send this element via wss
		// wss.sendMessage({ type: 'image', activeUserId, message: messageDoc })

		wss.sendMessage({ 
			type: 'image', 
			callerUserId: logedInUserId,
			calleeUserId: activeUserId, 
			message: messageDoc 
		})

	} catch (err) {
		showError(err.message)
	}
})



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

// Step-3: Add searched people and show them in that modal
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
			// searchPeopleModal.innerHTML = '' 					// Clear search result so that next click on search modal remain empty

			if(evt.target.tagName === 'BUTTON') {
				const container = evt.target.closest('[name=list-container]')

				evt.target.disabled = true

				const { error, data:friend } = await http.toggleFollow(container.id)
				if(error) return showError(error)

				// Step-1: toggle follow/unfollow tyle in the people search modal
				followFollowingHandler(evt) 					// style button
				evt.target.disabled = false

				// Step-2: Show or hide follow/unfollow people in the friendList
				const friends = Array.from(friendsListContainer.children)
				const findFriend = friends.find( currentFriend => currentFriend.id === friend.id )
				const { rooms } = store.getState()
				const isOnline = rooms.find( room => room.userId === friend.id )

				if(!findFriend) {
					showFriendsListContainerUI() 	// hide no friends message and show frindslist
					elements.createFirendList(friendsListContainer, {
						// --- user details
						id: friend.id,
						avatar: friend.avatar,
						name: friend.fullName,
						isActive: isOnline,

						// --- latestMessage 	details
						type: friend.latestMessage?.type,
						message: friend.latestMessage?.message,			
						createdAt: friend.latestMessage?.createdAt, 

						// --- Notification details
						// isNoNotification: true, 			// hide both new notification + success notification
						// isNotification: true, 					// for New notification: to work 'isNoNotification' must be false
						// notificationValue:  2,
						// isMessageSuccess: true, 				// for seen notification: to work 'isNotification' must be false
					})
				} else {
					findFriend.remove()
					if(!friends.length) return showFriendsNotFoundUI()
				}



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

		messagesContainer.innerHTML = '' 		// empty container before add new items
		chatContainer.innerHTML = '' 		// empty container before add new items

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


//----------[ Messages Delete Handling ]----------
messagesContainer.addEventListener('click', async (evt) => {
	if(evt.target.name !== 'close-message') return

	const containerEl = evt.container
	if(!containerEl) return showError(`container: ${containerEl} can't delete operation`)

	const messageId = containerEl.id
	const { status, message } = await http.deleteMessageById(messageId)
	if(message) return showError(message)

	// // remove element
	if(status === 'success') containerEl.remove()
})


// ----------[ video ]----------
export const updateLocalStream = (stream) => {
	yourVideo.src = undefined 				// 1. must remove src (if has)
	yourVideo.srcObject = stream 			// 2. add readable stream
	yourVideo.autoplay = true 				// 3. make sure plays continusly
	yourVideo.addEventListener('metadataloaded', () => yourVideo.play() ) // 4. when video ready only play then
}

export const updateRemoteStream = (stream) => {
	theirVideo.src = undefined 				// 1. must remove src (if has)
	theirVideo.srcObject = stream 		// 2. add readable stream
	theirVideo.autoplay = true 				// 3. make sure plays continusly
	theirVideo.addEventListener('metadataloaded', () => theirVideo.play() ) // 4. when video ready only play then
}




