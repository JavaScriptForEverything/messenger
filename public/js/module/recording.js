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