let array = []

self.addEventListener('message', (evt) => {
	if(evt.data === 'download') {
		
		const blob = new Blob( array )
		self.postMessage(blob)
		array = []

	} else {
		array.push(evt.data)
	}
})