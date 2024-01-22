// import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js'
import WaveSurfer from '../plugins/wavesurfer/index.js'
import { Snackbar } from '../module/components/index.js'
import { $ } from '../module/utils.js'
// import * as wss from '../module/wss.js'
// import * as store from '../module/store.js'
// import * as webRTCHandler from '../module/webRTCHandler.js'
// import * as constants from '../module/constants.js'
import * as elements from '../module/elements.js'
// import * as recording from '../module/recording.js'

/* only handle eventhandler in this page, don't try to update UI here
		- Because this file run only after every files loaded, that means
			it override others code if tie, so use ui.js to update UI.
*/

const socket = io('/')
// wss.registerSocketEvents(socket) 	// Handling all WebSocket events in wss.js file
// webRTCHandler.getLocalPreview()


const messageContainer = $('[name=message-container]')

const playPauseButton = $('[name=play-pause]')

const theirWavesurfer = WaveSurfer.create({
	container: '[name=their-audio] #waveform',
	waveColor: '#7ca4d0aa',
	progressColor: '#3b82f6',
	url: '/music/ignite.mp3', 			

	height: 32,
	response: true,
	barWidth: 2,
	barRadius: 2,
})
const yourWavesurfer = WaveSurfer.create({
	container: '[name=your-audio] #waveform',
	waveColor: '#7ca4d0aa',
	progressColor: '#3b82f6',
	url: '/music/ignite.mp3', 			

	height: 32,
	response: true,
	barWidth: 2,
	barRadius: 2,
})

playPauseButton.addEventListener('click', () => {
	theirWavesurfer.playPause() 	
	yourWavesurfer.playPause() 	
})

elements.createTheirMessage(messageContainer, 'hi')
elements.createYourMessage(messageContainer, 'whats up')

elements.createTheirAudio(messageContainer, { audioUrl: '/music/ignite.mp3' })
elements.createYourAudio(messageContainer, { audioUrl: '/music/ignite.mp3' })














// const $ = (selector) => document.querySelector( selector )

// const playButton = $('[name=play]')
// const stopButton = $('[name=stop]')

// const audioContext = new AudioContext()
// let audio = null

// const url = '/music/ignite.mp3'

// fetch(url)
// 	.then(res => res.arrayBuffer())
// 	.then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer)) 	// convert arrayBuffer => audioBuffer
// 	.then( audioBuffer => {
// 		audio = audioBuffer
// 	})

// const playback = () => {
// 	const playSound = audioContext.createBufferSource() // container for buffer from audioBuffer
// 	playSound.buffer = audio
// 	playSound.connect( audioContext.destination )
// 	playSound.start(audioContext.currentTime)

// 	stopButton.addEventListener('click', () => {
// 		playSound.stop()
// 	})
// }


// playButton.addEventListener('click', playback)