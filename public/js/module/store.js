import { callState } from './constants.js'

let state = {
	socketId: null,
	localStream: null,
	remoteStream: null,
	screenSharingStream: null,
	screenSharingActive: false,
	allowConnectionsFromStrangers: false,

	callState: callState.ONLY_CHAT_CALL_AVAILABLE, 		// CALL-BLOCK Step-1:
}


export const getState = () => state


export const setSocketId = (socketId) => {
	state = { ...state, socketId }
}

export const setLocalStream = (localStream) => {
	state = { ...state, localStream }
}
export const setScreenSharingStream = (screenSharingStream) => {
	state = { ...state, screenSharingStream }
}
export const setRemoteStream = (remoteStream) => {
	state = { ...state, remoteStream }
}
export const setScreenSharingActive = (screenSharingActive) => {
	state = { ...state, screenSharingActive }
}
export const setAllowConnectionsFromStreangers = (allowConnectionsFromStrangers) => {
	state = { ...state, allowConnectionsFromStrangers }
}

export const setCallState = (callState) => {
	state = { ...state, callState }
}