const $ = (selector) => document.querySelector(selector)
const audio = $('[name=audio]')
const recordButton = $('[name=record]')
const stopButton = $('[name=stop]')
const downloadButton = $('[name=download]')

let stream = new MediaStream()
let recorder = new MediaRecorder(stream)
let audioExt = MediaRecorder.isTypeSupported('audio/ogg;codecs=opus') ? 'ogg' : 'webm'
let chunks = []

let timer = 0

const startRecording = (evt) => {
	console.log('start recording')

	let count = 0

	clearInterval(timer)
	timer = setInterval(() => {
		console.log(count)
		count ++
	}, 1000)

	recordButton.removeEventListener('click', startRecording)
}
const stopRecording = (evt) => {
	console.log('stop recording')
	clearInterval(timer)
	stopButton.removeEventListener('click', stopRecording)
}

recordButton.addEventListener('click', startRecording)
stopButton.addEventListener('click', stopRecording)


/*

const startRecording = async () => {
	console.log('recording started')

	try {
		stream = await navigator.mediaDevices.getUserMedia({ audio: true })
	} catch (error) {
		console.log(error.message)	
		alert(error.message)
	}
	recorder = new MediaRecorder(stream, { mimetype: `audio/${audioExt};codecs=opus` })

	recorder.start(1000) // start record with 1sec chunk

	// To show audio time counter immediately
	audio.srcObject = stream 	// removed srcObject property when add src = dataUrl after finished
	audio.controls = true
	audio.autoplay = true

	recorder.addEventListener('dataavailable', (evt) => {
		chunks.push( evt.data )

		if( recorder.state === 'inactive' ) {
			const blob = new Blob(chunks, { type: `audio/${audioExt}`, bitsPerSecond: 128000 })
			chunks = []
			showAudio(blob)
		}
	})
}

const showAudio = (blob) => {
	audio.srcObject = null 	// remove old audio.srcObject added in record starting time

	const dataUrl = URL.createObjectURL(blob)
	audio.src = dataUrl
	audio.controls = true
	audio.autoplay = false
	//- URL.revokeObjectURL(dataUrl) 	// Don't remove url, else audio will be no more
}

const downloadAudioRecording = () => {
	if( !audio.src ) return console.log('recorde video first')

	const a = document.createElement('a')
	a.href = audio.src
	a.download = Date.now() + '.' + audioExt
	a.click()
	a.style = "display: none;"
	document.body.appendChild(a)
}

const stopRecording = () => {
	if(recorder?.state === 'recording' || recorder?.state === 'paused') {
		console.log('recording stopped')

		recorder.stop() 	// stop MediaRecorder
		stream.getAudioTracks()[0].stop() 	// Stop microphone: Stop device entirely
	}
}

recordButton.addEventListener('click', startRecording)
stopButton.addEventListener('click', stopRecording)
downloadButton.addEventListener('click', downloadAudioRecording)
*/