



const button = document.querySelector('button')
const progress = document.querySelector('progress')
const span = document.querySelector('span')

const url = '/images/avatar.jpg'

button.addEventListener('click', async () => {
	const res = await fetch(url)
	const blob = await res.blob()

	const data = blob.stream()
	console.log(data)
})


/*


const updateUI = (value) => {
	progress.value = value	
	span.textContent = value.toFixed() + '%'
}

button.addEventListener('click', () => {
	fetchData()
})



const largeFile = 'https://res.cloudinary.com/javascriptforeverything/video/upload/v1706136879/ba0ovmx1g5m85cxdhap4.mp4'
const mediumFile = 'https://res.cloudinary.com/javascriptforeverything/image/upload/v1622711168/samples/cloudinary-group.jpg'
const smallFile = 'https://res.cloudinary.com/javascriptforeverything/image/upload/v1639477991/next-amazona/images/pants3_ak1hql.jpg'

const fetchData = async () => {
	const res = await fetch(largeFile)
	// const blob = await res.blob()
	
	const readableStream = res.body

	const reader = readableStream.getReader()
	const contentType = res.headers.get('content-type') 			// See Respose reader in network tab
	const contentLength = +res.headers.get('content-length') 	// => make sure it number

	const chunks = []
	let receivedLength = 0

	// eslint-disable-next-line no-constant-condition
	while(true) {
		const { done, value } = await reader.read()
		if(done) break; 	 // if done then value also null or undefined and ignore before add

		chunks.push(value)
		receivedLength += value.length
		const percentage = (receivedLength / contentLength ) * 100

		updateUI(percentage)
	}

	const blob = new Blob(chunks, { type: contentType, size: contentLength })
	const dataUrl = URL.createObjectURL(blob)

	const a = document.createElement('a')
	a.href = dataUrl
	a.download = contentType.split('/').pop()
	a.click()
	URL.revokeObjectURL(dataUrl)
}
*/