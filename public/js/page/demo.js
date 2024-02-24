



const video = document.querySelector('video')
const url = '/images/avatar.jpg'

navigator.mediaDevices.getUserMedia({ 
	audio: true, 
	video: {
		width: 1080,
		height: 720,
		facingMode: 'user'
	}
})
.then(stream => {
	console.log(stream)
	video.srcObject = stream
	video.addEventListener('loadedmetadata', () => {
		video.play()
	})
})

// button.addEventListener('click', async () => {
// 	const res = await fetch(url)
// 	const blob = await res.blob()

// 	const data = blob.stream()
// 	console.log(data)
// })

