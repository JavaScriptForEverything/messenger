import { Snackbar } from '../module/components/index.js'
import { $ } from '../module/utils.js'
// import * as wss from '../module/wss.js'
// import * as store from '../module/store.js'
// import * as webRTCHandler from '../module/webRTCHandler.js'
// import * as constants from '../module/constants.js'
// import * as elements from '../module/elements.js'
// import * as recording from '../module/recording.js'

/* only handle eventhandler in this page, don't try to update UI here
		- Because this file run only after every files loaded, that means
			it override others code if tie, so use ui.js to update UI.
*/

const socket = io('/')
// wss.registerSocketEvents(socket) 	// Handling all WebSocket events in wss.js file
// webRTCHandler.getLocalPreview()

