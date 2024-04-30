import * as ui from './ui.js'
import * as store from './store.js'
import * as wss from './wss.js'
import { WEB_RTC_SIGNAL } from './constants.js'

let peerConnection = null

export const getLocalPreview = async ({ connectionType='video' } = {}) => {
	const options = connectionType === 'audio' ? { audio: true } : { audio: true, video: true }
	try {
		
		const stream = await navigator.mediaDevices.getUserMedia( options )
		store.setLocalStream(stream)
		ui.updateLocalStream(stream)
		// ui.updateRemoteStream(stream)

	

	} catch (err) {
		ui.showError(err.message)
		console.log(err)		
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
	// if(peerConnection) peerConnection.close()

	const constrains = {
		iceServers: [
			{
				urls: 'stun:stun.1.google.com:13902' 		// free
			}
		]
	}

	// WebRTC: step-0: create connection on both-side
	peerConnection = new RTCPeerConnection(constrains)

// WebRTC: step-4: send icecandidate from both side, because this function will be called in both side
	peerConnection.addEventListener('icecandidate', (evt) => {
		console.log('both-side: step-4: send to other peer, and handle too')

		if(evt.candidate) {
			wss.sendIceCandedate({
				calleeUserId: store.getState().activeUserId,
				signalType: WEB_RTC_SIGNAL.ICE_CANDIDATE,
				candidate: evt.candidate
			})
		}
	})

	peerConnection.addEventListener('connectionstatechange', (evt) => {
		console.log('both-side: step-6: connection established')
	})

}


// WebRTC: step-1: create offer and send from caller-side to callee
export const sendWebRTCOffer = async () => {
	if(!peerConnection) return
	console.log('caller-side: step-1: send-offer')

	try {
		const offer = await peerConnection.createOffer() 		 	// 1. create offer
		await peerConnection.setLocalDescription(offer) 			// 2. set into localDescription

		wss.sendOffer({  																			// 3. send offer to callee
			calleeUserId: store.getState().activeUserId, 
			signalType: WEB_RTC_SIGNAL.OFFER, 
			offer 
		})

	} catch (err) {
		ui.showError(`send offer failed: ${err.message}`)
		console.log(err)
	}
}

// WebRTC: step-2: get offer and send answer caller-side back
export const handleWebRTCOfferAndSendAnswer = async ({ offer, calleeUserId }) => {
	if(!peerConnection) return
	console.log('callee-side: step-2: send-answer')
	
	try {
		await peerConnection.setRemoteDescription(offer) 			// 1. get offer and set into remote description 
		const answer = await peerConnection.createAnswer() 		// 2. create answer
		await peerConnection.setLocalDescription(answer) 			// 3. set answer to local description
		wss.sendAnswer({
			calleeUserId,
			signalType: WEB_RTC_SIGNAL.ANSWER,
			answer
		})
		
	} catch (err) {
		ui.showError(`send answer failed: ${err.message}`)
		console.log(err)
	}
}

// WebRTC: step-3: get answer back from callee-side
export const handleWebRTCAnswer = async ({ answer }) => {
	if(!peerConnection) return
	console.log('caller-side: step-3: get-answer-back')
	
	try {
		await peerConnection.setRemoteDescription(answer)
		
	} catch (err) {
		ui.showError(`handle answer failed: ${err.message}`)
		console.log(err)
	}
}


// WebRTC: step-5: get candidate back 
export const handleIceCandidate = async (candidate) => {
	if(!peerConnection) return
	console.log('caller-side: step-3: get-answer-back')

	try {
		await peerConnection.addIceCandidate(candidate)
		
	} catch (err) {
		ui.showError(`handle icecandidate failed: ${err.message}`)
		console.log(err)
	}
}