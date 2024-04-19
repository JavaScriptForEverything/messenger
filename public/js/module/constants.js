
export const callType = {
	AUDIO_CALL 		: 'AUDIO-CALL',
	VIDEO_CALL 		: 'VIDEO-CALL',
	MESSAGE_CALL 	: 'MESSAGE-CALL',
}
export const offerType = {
	CALL_ACCEPTED 	: 'CALL_ACCEPTED',
	CALL_REJECTED 	: 'CALL_REJECTED',
	CALL_CLOSED 		: 'CALL_CLOSED',
	CALLEE_NOT_FOUND: 'CALLEE_NOT_FOUND', 		// if try to call to a personalCode which not exists in backend
	CALL_UNAVAILABLE: 'CALL_UNAVAILABLE', 		// if already calling someone: more than 2 user not allowed by WebRTC
}

export const callStatus = {
	CALL_AVAILABLE: 'CALL_AVAILABLE',
	CALL_UNAVAILABLE: 'CALL_UNAVAILABLE',
	CALL_BUSY: 'CALL_BUSY',
	CALL_ENGAGED: 'CALL_ENGAGED',
}