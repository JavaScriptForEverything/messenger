import * as ui from './ui.js'
import * as store from './store.js'
import * as wss from './wss.js'
import { CALL_TYPE } from './constants.js'

// export let peerConnection = null 		// used to close peer connection on other place
// let dataChannel = null

export let peerConnection = new RTCPeerConnection()
let dataChannel = peerConnection.createDataChannel('file-sharing')

/* 
	caller-side:
		. ui.js: audioCallHandler()
		. ui.js: videoCallHandler()

	callee-side:
		. ui.js: handlePreOffer()

*/ 
export const getLocalPreview = async () => {
	const { callType } = store.getState()

	const options = callType === CALL_TYPE.VIDEO_CALL 
		? { audio: true, video: true }
		: { audio: true } 

	try {
		const stream = await navigator.mediaDevices.getUserMedia( options )
		store.setLocalStream(stream)
		ui.updateLocalStream(stream)

	} catch (err) {
		ui.showError(err.message)
		// console.log(err)		
	}
}


/* Step-1: add connection on both-side: 
			const constrains = {
				iceServers: [
					{
						urls: 'stun:stun.1.google.com:13902' 		// free
					}
				]
			}
			const peerConnection = new RTCPeerConnection( constrains )

** Step-2: in caller-side: 	
			1. create offer
			2. set self offer into localDescription
			3. send offer to other-side's peer user

					const offer = await peerConnection.createOffer()
					peerConnection.setLocalDescription( offer )
					wss.sendOffer({ offer })


** Step-3: in callee-side: 	(order are very important)
			1. get caller-offer and save into remoteDescription
			2. create answer
			3. set self answer into localDescription
			4. send answer back to other-side's peer user

					const offer = wss.getOffer()
					peerConnection.setRemoteDescription( offer )

					const answer = await peerConnection.createAnswer()
					peerConnection.setLocalDescription( answer )
					wss.sendAnswer({ answer })

			. now callee has offer and answer set into theirs description


** Step-4: in caller-side: 	
			1. get answer
			2. set answer into remoteDescription

					const answer = wss.getAnswer()
					peerConnection.setRemoteDescription( answer )

			. now caller has offer and answer set into theirs description


Problem: `icecandidate` event not triggering after successfully set offer and answer in both side:
			- reason: early days, sharing offer/answer triggers icecandidate event, but not work in 2020
								need to do 2 things: [ see webRTC  section]

							but for now: need to add localStream to peerConnection, else ice candidate will not trigger

								const { localStream } = store.getState()
								localStream.getTracks().forEach( track => {
									peerConnection.addTrack(track, localStream)
								})

** Step-5: once the both side properly share ther offer/answer, the `icecandidate` event will trigger
			so we need to share the session candidate too on both-side to create Secure Tunnel between
			two peers only.

			and add add each others icecandidate into there peerConnection

			in step-1: inside peerConnection

					peerConnection.addEventListener('icecandidate', (evt) => {
						wss.sendIceCandedate({ candidate: evt.candidate })
					})

					wss.on('ice-candidate', ({ candidate }) => { 				// only listen to other peer icecandidate
						peerConnection.addIceCandidate( candidate )
					})

** Step-6: once the both side properly share ther icecandidate, the `connectionstatechange` event will trigger
			so we check if peerConnection.connectionState === 'connected' then engaged into call

*/

export const createPeerConnection = () => {
	const constrains = {
		iceServers: [ { urls: 'stun:stun.1.google.com:13902' } ]
	}

	// WebRTC: step-0: create connection on both-side
	peerConnection = new RTCPeerConnection(constrains)


	/* WebRTC: step-4: add local track to peerConnection, else ice candidate will not trigger
			1. Add localStream to peerConnection 		=> to share between other end peer
			2. get remoteStream from peerConnection <= to use yourself */
	
	// Step-4.1: add localStream to peerConnection
	const { localStream } = store.getState()
	localStream.getTracks().forEach( track => {
		peerConnection.addTrack(track, localStream)
	})

	// Step-4.2: get remoteStream to peerConnection
	// get tracks and convert the track into stream then use into video.srcObject 
	const remoteStream = new MediaStream()
	peerConnection.addEventListener('track', ({ track }) => {
		remoteStream.addTrack(track)
	})
	store.setRemoteStream(remoteStream)
	ui.updateRemoteStream(remoteStream)



	// WebRTC: step-5: send icecandidate from both side, because this function will be called in both side
	peerConnection.addEventListener('icecandidate', (evt) => {
		// console.log('WebRTC: both-side: step-5: send to other peer, and handle too')

		const { logedInUserId, activeUserId } = store.getState()

		if(evt.candidate) {
			wss.sendIceCandedate({
				callerUserId: logedInUserId,
				calleeUserId: activeUserId,
				candidate: evt.candidate
			})
		}
	})

	// WebRTC: step-7: when icecandidate === Session exchanged between peers, trigger for every state change
	peerConnection.addEventListener('connectionstatechange', (evt) => {
		// console.log('WebRTC: both-side: step-7: connection established')
		if(peerConnection.connectionState === 'connected') {
			// show video in ui

			ui.previewVideo()
		}
	})


	// WebRTC: Step-8: dataChannel Step-1: create dataChannel instance
	dataChannel = peerConnection.createDataChannel('file-sharing')


	// WebRTC: Step-10: dataChannel Step-3: listen on datachannel event
	peerConnection.addEventListener('datachannel', ({ channel }) => {
		channel.addEventListener('open', () => {
			// console.log('ready to share file via datachannel ')

			// allow drag-and-drop-file-shareing
			ui.activeDragAndDropFileSharing()
		})
		channel.addEventListener('close', () => {
			// console.log('datachannel closed')

			// disable drag-and-drop-file-shareing
			ui.disableDragAndDropFileSharing()
		})
		channel.addEventListener('error', () => {
			// console.log('datachannel error, so close datachannel ')
			ui.disableDragAndDropFileSharing()
		})

		let chunks = []
		channel.addEventListener('message', ({ data }) => {

			if( data instanceof Blob ) {
				chunks.push( data )

			} else {
				const { name, type } = JSON.parse(data)

				const blob = new Blob(chunks, { type } )
				chunks = [] 	// empty chunk after got blob 
				downloadBlob(blob, name)
			}

		})

	})
	const downloadBlob = (blob, name='file.jpeg') => {
		// console.log(blob, name)

		const dataUrl = URL.createObjectURL( blob )
		const a = document.createElement('a')
		a.href = dataUrl
		a.download = name

		a.style.display = 'none'
		document.body.appendChild(a)
		a.click()

		setTimeout(() => {
			document.body.removeChild(a)
			URL.revokeObjectURL(dataUrl)
		}, 100);

	}
}



// WebRTC: step-1: create offer and send from caller-side to callee
export const sendWebRTCOffer = async () => {
	if(!peerConnection) return
	// console.log('WebRTC: caller-side: step-1: send-offer')

	try {
		const offer = await peerConnection.createOffer() 		 	// 1. create offer
		await peerConnection.setLocalDescription(offer) 			// 2. set into localDescription

		const { logedInUserId, activeUserId } = store.getState()

		wss.sendOffer({  																			// 3. send offer to callee
			callerUserId: logedInUserId, 
			calleeUserId: activeUserId, 
			// signalType: WEB_RTC_SIGNAL.OFFER, 
			offer 
		})

	} catch (err) {
		ui.showError(`send offer failed: ${err.message}`)
		// console.log(err)
	}
}

// WebRTC: step-2: get offer and send answer caller-side back
export const handleWebRTCOfferAndSendAnswer = async ({ callerUserId, offer }) => {
	if(!peerConnection) return
	// console.log('WebRTC: callee-side: step-2: send-answer')

	try {
		await peerConnection.setRemoteDescription(offer) 			// 1. get offer and set into remote description 
		const answer = await peerConnection.createAnswer() 		// 2. create answer
		await peerConnection.setLocalDescription(answer) 			// 3. set answer to local description
		wss.sendAnswer({
			callerUserId: store.getState().logedInUserId,
			calleeUserId: callerUserId,
			answer
		})


	} catch (err) {
		ui.showError(`send answer failed: ${err.message}`)
		// console.log(err)
	}
}

// WebRTC: step-3: get answer back from callee-side
export const handleWebRTCAnswer = async ({ answer }) => {
	if(!peerConnection) return
	// console.log('WebRTC: caller-side: step-3: get-answer-back')
	
	try {
		await peerConnection.setRemoteDescription(answer)
		
	} catch (err) {
		ui.showError(`handle answer failed: ${err.message}`)
		// console.log(err)
	}
}


// WebRTC: step-6: get candidate back 
export const handleIceCandidate = async ({ candidate }) => {
	if(!peerConnection) return
	// console.log('WebRTC: caller-side: step-6: get-answer-back')

	try {
		await peerConnection.addIceCandidate(candidate)
		
	} catch (err) {
		ui.showError(`handle icecandidate failed: ${err.message}`)
		// console.log(err)
	}
}


export const closeHandler = async () => {
	if(!peerConnection) return
	// console.log('WebRTC: close handler')

	// const { localStream } = store.getState()

	try {
		await peerConnection.close() 		// close webRTC connection
		peerConnection = null
		// localStream.getTracks().forEach( track => track.stop()) 	// turn off WebCam
		ui.turnOffWebCam()
		
	} catch (err) {
		ui.showError(`webRTC close failed: ${err.message}`)
		// console.log(err)
	}
	
}


export const toggleMute = (isEnabled = true) => {
	const { localStream } = store.getState()
	localStream.getAudioTracks().forEach( track => track.enabled = isEnabled )
}
export const toggleCamera = (isEnabled = true) => {
	const { localStream } = store.getState()
	localStream.getVideoTracks().forEach( track => track.enabled = isEnabled )
}


// home.js: callPanelScreenShareButton.addEventListener('click', (evt) => {...})
export const turnOnScreenShare = async () => {
	if(!peerConnection) return

	const options = {
		// audio: true,
		video: true,
	}

	try {
		// Step-1: Get Display Stream
		const screenShareStream = await navigator.mediaDevices.getDisplayMedia(options)

		// Step-2:
		const screenShareVideoTrack = screenShareStream.getVideoTracks()[0]

		const senders = peerConnection.getSenders()
		const sender = senders.find( sender => sender.track.kind === screenShareVideoTrack.kind )
		if(!sender) throw new Error('sender not found')
		sender.replaceTrack(screenShareVideoTrack)

		// Step-3: change camera to screenShare
		ui.updateLocalStream( screenShareStream )
		store.setScreenShareScream( screenShareStream )

		/* Step-4: stop camera stream: 
		** Problem: if I do bellow steps then when switch back to webCam, then peer not got localSteam any more
		*/
		// store.getState().localStream.getTracks().forEach( track => track.stop() )
		// store.setLocalStream(null)


	} catch (err) {
		ui.showError(`screenShare failed: ${err.message}`)
		// console.log(err)
	}
}

// home.js: callPanelScreenShareButton.addEventListener('click', (evt) => {...})
export const turnOffScreenShare = async () => {
	if(!peerConnection) return

	try {
		// Step-1: Get webCam Stream from store
		const { localStream } = store.getState()

		// Step-2:
		const localVideoTrack = localStream.getVideoTracks()[0]

		const senders = peerConnection.getSenders()
		const sender = senders.find( sender => sender.track.kind === localVideoTrack.kind )
		if(!sender) throw new Error('sender not found')
		sender.replaceTrack(localVideoTrack)

		// Step-3: change back to camera from screenShare
		ui.updateLocalStream( localStream )

		// Step-4: stop screenShare stream
		store.getState().screenShareStream.getTracks().forEach( track => track.stop() )
		store.setScreenShareScream( null )


	} catch (err) {
		ui.showError(`screenShare failed: ${err.message}`)
		// console.log(err)
	}
}




// WebRTC: Step-9: dataChannel Step-2: Send data via dataChannel
export const sendFileByDataChannel = (payload) => {
	if(!dataChannel) return

	dataChannel.send(payload)
	// payload can be: string | Blob | arrayBuffer | TypedArray | DataView
}