import * as elements from '../module/elements.js'
import { getReadableFileSizeString } from '../module/utils.js'


const $ = (selector) => document.querySelector(selector)
const dragAndDropContainer = $('[name=drag-and-drop-container]')
const dropListContainer = $('[name=drop-list-container]')
const dragAndDropFileInput = $('[id=drag-and-drop-file]')

dragAndDropContainer.addEventListener('dragover', (evt) => {
	evt.preventDefault()
	evt.target.style.borderColor = '#2879e377'
})
dragAndDropContainer.addEventListener('dragleave', (evt) => {
	const rect = evt.target.getBoundingClientRect()
	if(
		evt.clientX > rect.left + rect.width || 
		evt.clientX < rect.left || 
		evt.clientY > rect.top + rect.height || 
		evt.clientY < rect.top
	) {
		evt.target.removeAttribute('style')
	}
})
	
const element = elements.dropList({
	fileName: 'name.txt',
	fileSize: getReadableFileSizeString(4987293),
})
dropListContainer.insertAdjacentElement('beforeend', element)


let timer = 0
// setInterval(() => {
// }, 1000);

const showDragItemsInUI = (fileArray) => {
	fileArray.forEach( async (file) => {

		const maxFileSize = 2*1024*1024*1024 		// => 2 GB
		if(file.size > maxFileSize) {
			console.log('max file-size: 2 GB')
			// return
		} 

		const dropList = elements.dropList({
			fileName: file.name,
			fileSize: getReadableFileSizeString(file.size),
		})
		dropListContainer.insertAdjacentElement('beforeend', dropList)

		let downloadedSize = 0

		try {
			const stream = file.stream()
			const reader = stream.getReader()

			const handleReading = (done, value) => {
				if(done) {
					// webRTC.sendFileByDataChannel(JSON.stringify({ done: true, name: file.name, type: file.type }))
					// ui.removeDragAndDropDownloadingIndicator()


					setTimeout(() => {
						// store.setIsDownloading(false)
					}, 1000);

					console.log({ downloadedSize, totalSize: file.size })

					return
				}

				downloadedSize += value.length
				console.log({ downloadedSize })

				// webRTC.sendFileByDataChannel(value) 			// send arrayBuffer of stream
				// ui.addDragAndDropDownloadingIndicator() 	// 

				reader.read().then( ({ done, value }) => {
					handleReading(done, value)
				})
			}

			reader.read().then( ({ done, value }) => {
				handleReading(done, value)
			})




		} catch (err) {
			console.log('file.arrayBuffer() failed')	
		}
	})
}



// const showDragItemsInUI = (fileArray) => {
// 	fileArray.forEach( file => {

// 		// dropListContainer.insertAdjacentElement('beforeend', dropList({
// 		// 	fileName: file.name,
// 		// 	fileSize: getReadableFileSizeString(file.size),
// 		// }))

// 	})
// }

dragAndDropContainer.addEventListener('drop', (evt) => {
	evt.preventDefault()
	evt.target.removeAttribute('style')

	const fileArray = [...evt.dataTransfer.files]
	showDragItemsInUI(fileArray)
})
dragAndDropFileInput.addEventListener('change', (evt) => {
	evt.preventDefault()

	const fileArray = [...evt.target.files]
	showDragItemsInUI(fileArray)
})



