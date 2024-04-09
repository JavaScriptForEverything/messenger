import { $, calculateAudioCurrentTimeValue } from './utils.js'
import * as ui from './ui.js'

const writeMessageInput = $('[name=write-message-input]') 	

let timer = 0
let stream = new MediaStream()
let recorder = new MediaRecorder(stream)
let audioExt = MediaRecorder.isTypeSupported('audio/ogg;codecs=opus') ? 'ogg' : 'webm'
let chunks = []
let currentTime = 0;
let audioDuration = 0;


export const startRecording = async (audio) => {
	stream = await navigator.mediaDevices.getUserMedia({ audio: true })
	audio.srcObject = stream
	audio.controls = true
	audio.autoplay = true

	// elements.createYourAudio(messageContainer, { audioUrl: '/music/ignite.mp3' })

	const recorderOptions = {
		mimetype: `audio/${audioExt};codecs=opus` 
	}
	recorder = new MediaRecorder(stream, recorderOptions)
	recorder.start()

	recorder.addEventListener('dataavailable', (evt) => {
		chunks.push( evt.data )

		// trigger after `recorder.stop()` invoked
		if( recorder.state === 'inactive' ) {
			const blob = new Blob(chunks, { type: `audio/${audioExt}`, bitsPerSecond: 128000 })
			chunks = []
			ui.showAudio(blob, audio, audioDuration)
		}
	})


	clearInterval(timer)
	timer = setInterval(() => {
		currentTime = calculateAudioCurrentTimeValue( audio.currentTime )
		writeMessageInput.value = currentTime
	}, 1000)

}

export const stopRecording = (audio) => {
	audioDuration = audio.currentTime 	// set audio duration before recording.stop() and clearTimer

	clearInterval(timer)

	audio.srcObject = null
	audio.controls = false
	audio.autoplay = false

	URL.revokeObjectURL(audio.src) 	// audio.src = dataUrl
	recorder.stop()
}













/*
import * as store from './store.js'

let mediaRecorder = null
let recordedChunks = []

let vp9Codec = "video/webm; codecs=v=9"
let options = { mimeType: vp9Codec }


export const startRecording = () => {
	const { remoteStream } = store.getState()
	if(!remoteStream) return console.log('stream is empty to recorde so declined recording')

	if(MediaRecorder.isTypeSupported(vp9Codec)) {
		mediaRecorder = new MediaRecorder(remoteStream, options)
	} else {
		mediaRecorder = new MediaRecorder(remoteStream)
	}

	mediaRecorder.addEventListener('dataavailable', (evt) => {
		if(evt.data.size <= 0 ) return
		recordedChunks.push( evt.data )
		downloadRecording()
	})

	mediaRecorder.start()
}

export const pauseRecording = () => {
	if(!mediaRecorder) return
	mediaRecorder.pause()
}
export const resumeRecording = () => {
	if(!mediaRecorder) return
	mediaRecorder.resume()
}
export const stopRecording = () => {
	if(!mediaRecorder) return
	mediaRecorder.stop()
}

const downloadRecording = () => {
	const blob = new Blob(recordedChunks, { type: 'video/webm' })

	const dataUrl = URL.createObjectURL(blob)
	const a = document.createElement('a')
	document.body.appendChild(a)

	a.style='display: none'
	a.href = dataUrl
	a.download = 'recorded-video.webm'
	a.click()

	URL.revokeObjectURL(dataUrl)
	recordedChunks = []
}
*/