import WaveSurfer from '/js/plugins/wavesurfer/index.js'

import { encodeHTML, stringToElement } from './utils.js'
// export const getIncommingCallDialog = (exactCallType, acceptCallHandler, rejectCallHandler) => {
// }


// elements.createTheirMessage(messageContainer, 'hi')
export const createTheirMessage = (selector, message) => {
	const encodedMessage = encodeHTML(message)
	const htmlString = `
		<div name='their-message-container' class='flex items-start gap-2 mb-2'> 
			<img src='/images/logo.png' alt='their avatar' class='w-6 h-6 rounded-full' />
			<div class='max-w-[80%] px-2 py-1 bg-slate-200 border border-slate-300 rounded-md rounded-tl-none'>
				<p name='their-message' class='text-slate-600'> ${encodedMessage} </p>
			</div>
		</div>
	`
	// selector.insertAdjacentHTML('beforeend', htmlString)

	const element = stringToElement(htmlString)
	selector.insertAdjacentElement('beforeend', element)
	element.querySelector('[name=their-message]').scrollIntoView({ behavior: 'smooth' })
}

// elements.createYourMessage(messageContainer, 'whats up')
export const createYourMessage = (selector, message) => {
	const encodedMessage = encodeHTML(message)
	const htmlString = `
		<div name='your-message-container' class='flex items-end gap-2 mt-2'>
			<div class='max-w-[80%] ml-auto px-2 py-1 bg-blue-200 border border-blue-300 rounded-md rounded-br-none'>
				<p name='your-message' class='text-blue-950/80'>${encodedMessage}</p>
			</div>
			<span class='text-blue-500'>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M21 7L9 19l-5.5-5.5l1.41-1.41L9 16.17L19.59 5.59z"/></svg>
			</span>
		</div>
	`
	// selector.insertAdjacentHTML('beforeend', htmlString)
	//- <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M.41 13.41L6 19l1.41-1.42L1.83 12m20.41-6.42L11.66 16.17L7.5 12l-1.43 1.41L11.66 19l12-12M18 7l-1.41-1.42l-6.35 6.35l1.42 1.41z"/></svg>

	const element = stringToElement(htmlString)
	selector.insertAdjacentElement('beforeend', element)
	element.querySelector('[name=your-message]').scrollIntoView({ behavior: 'smooth' })
}

// elements.createTheirAudio(messageContainer, { audioUrl: '/music/ignite.mp3' })
export const createTheirAudio = (selector, { id=null, audioUrl= '' }) => {
	if(!audioUrl) return console.log('audioUrl missing')

	let containerId = id || crypto.randomUUID()
			containerId = `wrapper-${containerId}` 

	const playPauseCheckbox = `${containerId}-play-pause-checkbox`
	const htmlString = `
		<div name='their-audio' id=${containerId} class='mb-2 max-w-[80%] p-1 flex gap-1 items-center bg-slate-100  border border-slate-200 rounded-md'>
			<div class='relative'>
				<img src='/images/users/default.jpg' alt='sender' class='w-10 h-10 rounded-full p-0.1 bg-white' />
				<button type='button' class='p-[1px] rounded-full bg-slate-50 text-blue-500 absolute bottom-0.5 -right-0.5'>
					<svg class='w-4 h-4 pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3m7 9c0 3.53-2.61 6.44-6 6.93V21h-2v-3.07c-3.39-.49-6-3.4-6-6.93h2a5 5 0 0 0 5 5a5 5 0 0 0 5-5z"/></svg>
				</button>
			</div>

			<div name='wavefrom-container' class='flex-1 flex gap-2'>
				<input type='checkbox' id='${playPauseCheckbox}' hidden class='peer/play-pause hidden' />
				<label name='play-pause' for='${playPauseCheckbox}' class=" cursor-pointer 
					peer-checked/play-pause:[&>*:first-child]:hidden [&>*:first-child]:block
					peer-checked/play-pause:[&>*:nth-child(2)]:block [&>*:nth-child(2)]:hidden
				">
					<svg class='w-6 h-6 pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5.14v14l11-7z"/></svg>
					<svg class='w-6 h-6 pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M14 19V5h4v14zm-8 0V5h4v14z"/></svg>
				</label>

				<div class='flex-1'>
					<div id="waveform" class='flex-1'> </div>
					<div class='mb-0.5 flex justify-between items-center px-4 font-light text-xs text-slate-800'>
						<span>0.30</span>
						<span>3.45 pm</span>
					</div>
				</div>
			</div>
		</div>
	`

	const element = stringToElement(htmlString)
	selector.insertAdjacentElement('beforeend', element)
	element.scrollIntoView({ behavior: 'smooth' })

	/* 	element.name 									=> undefined	 ?
			element.getAttribute('name') 	=> their-audio */

	const playPauseButton = element.querySelector('[name=play-pause]')
	const wavesurfer = WaveSurfer.create({
		container: `#${containerId} #waveform`, 	
		waveColor: '#7ca4d0aa',
		progressColor: '#3b82f6',
		url: audioUrl,

		height: 32,
		response: true,
		barWidth: 2,
		barRadius: 2,
	})

	playPauseButton.addEventListener('click', () => {
		wavesurfer.playPause() 	
	})

}


// elements.createYourAudio(messageContainer, { audioUrl: '/music/ignite.mp3' })
export const createYourAudio = (selector, { id=null, audioUrl= '' }) => {
	if(!audioUrl) return console.log('audioUrl missing')

	let containerId = id || crypto.randomUUID()
			containerId = `wrapper-${containerId}` 

	const playPauseCheckbox = `${containerId}-play-pause-checkbox`
	const htmlString = `
		<div name='your-audio' id='${containerId}' class='mb-2 max-w-[80%] ml-auto p-1 flex gap-1 items-center bg-blue-200 text-blue-700 border border-blue-200 rounded-md'>
			<div class='relative order-1'>
				<img src='/images/users/default.jpg' alt='sender' class='w-10 h-10 rounded-full p-0.1 bg-white' />
				<button type='button' class='p-[1px] rounded-full bg-slate-50 text-blue-500 absolute bottom-0.5 -left-0.5'>
					<svg class='w-4 h-4 pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3m7 9c0 3.53-2.61 6.44-6 6.93V21h-2v-3.07c-3.39-.49-6-3.4-6-6.93h2a5 5 0 0 0 5 5a5 5 0 0 0 5-5z"/></svg>
				</button>
			</div>

			<div name='wavefrom-container' class='flex-1 flex gap-2'>
				<input type='checkbox' id='${playPauseCheckbox}' hidden class='peer/play-pause hidden' />
				<label name='play-pause' for='${playPauseCheckbox}' class="cursor-pointer 
					peer-checked/play-pause:[&>*:first-child]:hidden [&>*:first-child]:block
					peer-checked/play-pause:[&>*:nth-child(2)]:block [&>*:nth-child(2)]:hidden
				" >
					<svg class='w-6 h-6 pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5.14v14l11-7z"/></svg>
					<svg class='w-6 h-6 pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M14 19V5h4v14zm-8 0V5h4v14z"/></svg>
				</label>

				<div class='flex-1'>
					<div id="waveform" class='flex-1'> </div>
					<div class='mb-0.5 flex justify-between items-center px-4 font-light text-xs text-slate-800'>
						<span> 0.30 </span>
						<span> 3.45 pm </span>
					</div>
				</div>
			</div>
		</div>
	`

	const element = stringToElement(htmlString)
	selector.insertAdjacentElement('beforeend', element)
	element.scrollIntoView({ behavior: 'smooth' })

	/* 	element.name 									=> undefined	 ?
			element.getAttribute('name') 	=> their-audio */

	const playPauseButton = element.querySelector('[name=play-pause]')
	const wavesurfer = WaveSurfer.create({
		container: `#${containerId} #waveform`, 	
		waveColor: '#7ca4d0aa',
		progressColor: '#3b82f6',
		url: audioUrl,

		height: 32,
		response: true,
		barWidth: 2,
		barRadius: 2,
	})

	playPauseButton.addEventListener('click', () => {
		wavesurfer.playPause() 	
	})

}