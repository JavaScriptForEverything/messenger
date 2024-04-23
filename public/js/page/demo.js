import '../plugins/cropper/cropper.min.js'

const $ = (selector) => document.querySelector(selector)

const avatar = $('[name=avatar]')
const imagePreview = $('[name=crop-preview]')
const cropButton = $('[name=crop-button]')
const cropDownload = $('[name=crop-download]')


const cropper = new Cropper(avatar, { })

cropButton.addEventListener('click', () => {
	const canvas = cropper.getCroppedCanvas()
	const dataUrl = canvas.toDataURL()

	imagePreview.src = dataUrl
})

cropDownload.addEventListener('click', () => {
	const canvas = cropper.getCroppedCanvas()
	const dataUrl = canvas.toDataURL()

	// const dataUrl = imagePreview.src  		// or get from previous image

	const a = document.createElement('a')
	a.href = dataUrl
	a.download = 'crop-download.png'
	a.click()
})