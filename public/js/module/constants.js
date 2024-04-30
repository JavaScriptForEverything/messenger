
export const CALL_TYPE = {
	AUDIO_CALL 		: 'AUDIO-CALL',
	VIDEO_CALL 		: 'VIDEO-CALL',
	MESSAGE_CALL 	: 'MESSAGE-CALL',
}
export const OFFER_TYPE = { 								// PRE_OFFER_TYPE
	CALL_ACCEPTED 	: 'CALL_ACCEPTED',
	CALL_REJECTED 	: 'CALL_REJECTED',
	CALL_CLOSED 		: 'CALL_CLOSED',
	CALLEE_NOT_FOUND: 'CALLEE_NOT_FOUND', 		// if try to call to a personalCode which not exists in backend
	CALL_UNAVAILABLE: 'CALL_UNAVAILABLE', 		// if already calling someone: more than 2 user not allowed by WebRTC
}

export const CALL_STATUS = { 											// make same callStatus as constants.js in client-side has
	CALLING: 'CALLING',
	CALL_ENGAGED: 'CALL_ENGAGED',
	CALL_BUSY: 'CALL_BUSY',
	CALL_AVAILABLE: 'CALL_AVAILABLE',
	CALL_UNAVAILABLE: 'CALL_UNAVAILABLE',
}


export const WEB_RTC_SIGNAL = {
	OFFER: 'OFFER',
	ANSWER: 'ANSWER',
	ICE_CANDIDATE: 'ICE_CANDIDATE'
}
