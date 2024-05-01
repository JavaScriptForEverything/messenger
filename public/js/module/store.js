import { CALL_TYPE } from '../module/constants.js'

/*
	To work store we must call after given value, if try to read before it returns null, 
	so suppose, we set store value in wss connection established, so we must access

	on events, which will fire later, to get access value. 
*/

const store = {
	logedInUser: null,
	logedInUserId: null,
	activeUserId: null,
	rooms: [{}],
	localStream: null,
	remoteStream: null,
	callType: CALL_TYPE.AUDIO_CALL
}

export const getState = () => store
export const setLogedInUser = (logedInUser) => {
	store.logedInUser = logedInUser
	store.logedInUserId = logedInUser._id
}
export const setActiveUserId = (activeUserId) => store.activeUserId = activeUserId
export const setRooms = (rooms) => store.rooms = rooms

export const setLocalStream = (stream) => store.localStream = stream
export const setRemoteStream = (stream) => store.remoteStream = stream
export const setCallType = (callType) => store.callType = callType


