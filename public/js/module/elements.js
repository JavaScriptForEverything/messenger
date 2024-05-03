import WaveSurfer from '/js/plugins/wavesurfer/index.js'

import { 
	calculateAudioCurrentTimeValue, 
	calculateAudioTotalTimeValue, 
	encodeHTML, 
	readAsDataURL, 
	stringToElement 
} from './utils.js'
// export const getIncommingCallDialog = (exactCallType, acceptCallHandler, rejectCallHandler) => {
// }


// elements.createTheirMessage(messageContainer, 'hi')
export const createTheirMessage = (selector, payload) => {
	const { 
		message='',
		type='text', 
		avatar='',

	} = payload

	const encodedMessage = encodeHTML(message)
	const htmlString = `
		<div name='their-message-container' class='flex items-start gap-2 mb-2'> 
			<img src=${avatar || ''} alt='their avatar' class='w-6 h-6 rounded-full border border-slate-300' />
				${
					type === 'image'
					? `
						<div class='max-w-[80%] p-0.5 bg-slate-200 border border-slate-300 rounded-md rounded-tl-none'>
							<img name='their-message' src='${message}' class='object-cover' />
						</div>
					` 
					: `
						<div class='max-w-[80%] px-2 py-1 bg-slate-200 border border-slate-300 rounded-md rounded-tl-none'>
							<p name='their-message' class='text-slate-600'> ${encodedMessage} </p>
						</div>
					`
				}
		</div>
	`

	const element = stringToElement(htmlString)
	selector.insertAdjacentElement('beforeend', element)
	element.querySelector('[name=their-message]').scrollIntoView({ behavior: 'smooth' })
}

// elements.createYourMessage(messageContainer, 'whats up')
export const createYourMessage = (selector, { type='text', message='', }) => {
	const encodedMessage = encodeHTML(message)
	const htmlString = `
		<div name='your-message-container' class='flex items-end gap-2 mt-2'>
			${
				type === 'image'
				? `
					<div class='max-w-[80%] ml-auto p-0.5 bg-blue-200 border border-blue-300 rounded'>
						<img name='your-message' src='${message}' class='object-cover' />
					</div>
				` 
				: `
					<div class='max-w-[80%] ml-auto px-2 py-1 bg-blue-200 border border-blue-300 rounded-md rounded-br-none'>
						<p name='your-message' class='text-blue-950/80'>${encodedMessage}</p>
					</div>
				`
			}

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
export const createTheirAudio = (selector, { 
	id=null, 
	avatar='',
	audioUrl='',
	audioDuration='00:00',
	createdAt=Date.now(),
}) => {
	if(!audioUrl) return console.log('audioUrl missing')

	let containerId = id || crypto.randomUUID()
			containerId = `wrapper-${containerId}` 

	const playPauseCheckbox = `${containerId}-play-pause-checkbox`
	const htmlString = `
		<div name='their-audio' id=${containerId} class='mb-2 max-w-[80%] p-1 flex gap-1 items-center bg-slate-100  border border-slate-200 rounded-md'>
			<div class='relative'>
				<img src=${avatar || '/images/users/default.jpg'} alt='sender' class='w-10 h-10 rounded-full p-0.1 bg-white' />
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
						<span> ${calculateAudioCurrentTimeValue(audioDuration)} </span>
						<span> ${new Date( createdAt ).toLocaleTimeString('en', {
							hour: '2-digit',
							minute: 'numeric'
						})} </span>
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
export const createYourAudio = (selector, { 
	id=null, 
	avatar='',
	audioUrl='',
	audioDuration='00:00',
	createdAt=Date.now(),
}) => {
	if(!audioUrl) return console.log('audioUrl missing')

	let containerId = id || crypto.randomUUID()
			containerId = `wrapper-${containerId}` 

	const playPauseCheckbox = `${containerId}-play-pause-checkbox`
	const htmlString = `
		<div name='your-audio' id='${containerId}' class='mb-2 max-w-[80%] ml-auto p-1 flex gap-1 items-center bg-blue-200 text-blue-700 border border-blue-200 rounded-md'>
			<div class='relative order-1'>
				<img src=${avatar || '/images/users/default.jpg'} alt='sender' class='w-10 h-10 rounded-full p-0.1 bg-white' />
				<button type='button' class='p-[1px] rounded-full bg-slate-50 text-blue-500 absolute bottom-0.5 -left-0.5'>
					<svg class='w-4 h-4 pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3m7 9c0 3.53-2.61 6.44-6 6.93V21h-2v-3.07c-3.39-.49-6-3.4-6-6.93h2a5 5 0 0 0 5 5a5 5 0 0 0 5-5z"/></svg>
				</button>
			</div>

			<div name='wavefrom-container' class='flex-1 flex gap-2'>
				<input type='checkbox' id='${playPauseCheckbox}' class='peer/play-pause hidden' />
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
						<span> ${calculateAudioCurrentTimeValue(audioDuration)} </span>
						<span> ${new Date( createdAt ).toLocaleTimeString('en', {
							hour: '2-digit',
							minute: 'numeric'
						})} </span>
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
	const inputCheckbox = element.querySelector('[type=checkbox]')


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

	wavesurfer.on('finish', () => {
		inputCheckbox.checked = false
	})
	playPauseButton.addEventListener('click', () => {
		wavesurfer.playPause() 	
	})


}



/*
elements.createFirendList(leftFriendPanel, {
	avatar: '/images/users/default.jpg',
	name: 'Fiaz Sofeone Rakib',
	message: 'businessman textile', 		// required if type === 'text
	type: 'text', 											// text | audio | image

	createdAt: Date.now(), 

	isActive: true, 										// => Show blue circle to indicate active
	isMessageSuccess: true,
	isNotification=false, 							// override isMessageSuccess
	isNoNotification=false, 						// override both isMessageSuccess and IsNotification
	notificationValue:  2,
}) 

elements.createFirendList(friendsListContainer, {
	// --- user details
	id: friend.id,
	avatar: friend.avatar,
	name: friend.fullName,
	// isActive: true,

	// --- latestMessage 	details
	type: friend.latestMessage?.type,
	message: friend.latestMessage?.message,			
	createdAt: friend.latestMessage?.createdAt, 

	// --- Notification details
	// isNoNotification: true, 			// hide both new notification + success notification
	isNotification: true, 					// for New notification: to work 'isNoNotification' must be false
	notificationValue:  2,
	isMessageSuccess: true, 				// for seen notification: to work 'isNotification' must be false
})
*/
export const createFirendList = (selector, data) => {
	const {
	// --- user details
		id=null,
		avatar='',
		name = '',

	// --- user.latestMessage 	details
		type='text', 									// text | image | audio | video
		message = '', 		
		createdAt='', 
		isTitle=true, 								// if true then color bold

		// --- Notification details
		isActive=false,
		isMessageSuccess=false,
		isNotification=false, 				// override isMessageSuccess
		isNoNotification=false, 			// override both isMessageSuccess and IsNotification
		notificationValue= 2,

		showFollowButton=false, 			// 
		isFollowing=false, 						// buttonText === 'follow' ? 'follow' : 'unfollow'
	} = data

	const htmlString = `
		<div name='list-container' id='${id}' class='flex items-center gap-2 cursor-pointer px-2 py-1 bg-slate-50 hover:bg-slate-100 rounded 
			group/firend-list [&.selected]:bg-slate-200
			${ isActive ? ' active' : ''} 
			${ isMessageSuccess ? ' message-success' : ''} 
			${ isNotification ? ' message-notification' : ''} 

		'>
		${ avatar ? `
			<div class='flex-shrink-0 relative pointer-events-none'>
				<img src='${avatar}' alt='avatar' class='h-10 border border-slate-300 rounded-full' />
				<div class='group-[.active]/firend-list:block hidden absolute bottom-2 -right-0.5 w-2 h-2 rounded-full bg-green-500'></div>
			</div>
		` : ''}

			<div name='label-container' class='flex-1 flex flex-col justify-center pointer-events-none'>
				${name ? `
				<div name='name-container' class='flex items-center justify-between'>
					<p name='username' class='${isTitle ? 'text-blue-500 font-medium ' : 'text-slate-600'} max-w-36 capitalize truncate'>  ${name}
					${ createdAt ? `
					<p name='title' class='text-slate-600 font-light text-sm '>
						${new Date( createdAt ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
					</p>
					`: ''}
				</div>
				` : ''}

				<div name='message-container' class=' relative flex items-center justify-between'>
					<p for='title' class='text-slate-600 font-light text-sm max-w-40 capitalize truncate'> 

						${
							type === 'text' ? message 
						: type === 'image' ? 
						`<span class='flex gap-1 items-center text-slate-600'>
							<svg class='w-4 h-4 ' xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M9.75 13a2.25 2.25 0 1 1 4.5 0a2.25 2.25 0 0 1-4.5 0"/><path fill="currentColor" fill-rule="evenodd" d="M7.474 7.642A3.142 3.142 0 0 1 10.616 4.5h2.768a3.142 3.142 0 0 1 3.142 3.142a.03.03 0 0 0 .026.029l2.23.18c.999.082 1.82.82 2.007 1.805a22.07 22.07 0 0 1 .104 7.613l-.097.604a2.505 2.505 0 0 1-2.27 2.099l-1.943.157a56.61 56.61 0 0 1-9.166 0l-1.943-.157a2.505 2.505 0 0 1-2.27-2.1l-.097-.603c-.407-2.525-.371-5.1.104-7.613a2.226 2.226 0 0 1 2.007-1.804l2.23-.181a.028.028 0 0 0 .026-.029M12 9.25a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5" clip-rule="evenodd"/></svg>
							<span> Image
						</span>`
						: type === 'audio' ? 
						`<span class='flex gap-1 items-center text-slate-500'>
							<svg class='w-4 h-4 ' xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3m7 9c0 3.53-2.61 6.44-6 6.93V21h-2v-3.07c-3.39-.49-6-3.4-6-6.93h2a5 5 0 0 0 5 5a5 5 0 0 0 5-5z"/></svg>
							<span> Audio
						</span>`
						: ''}

					</p> 

					<p name='title-icon' class='
						text-blue-500 rounded-full 
						group-[.message-success]/firend-list:[&>*:first-child]:block 
						group-[.message-notification]/firend-list:[&>*:last-child]:block 
					'>
						<svg class='hidden' xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M21 7L9 19l-5.5-5.5l1.41-1.41L9 16.17L19.59 5.59z"/></svg>
						<span class='hidden px-1.5 rounded-full text-[length:12px] bg-blue-500 text-slate-50 absolute right-0 -top-1'> ${notificationValue} </span> 
					</p>
				</div>
			</div>

			${isNoNotification && showFollowButton ? `
				<button class='${isFollowing ? 'active' : '' } border border-blue-500 px-3 py-0.5 rounded text-blue-500 [&.active]:bg-blue-500 [&.active]:text-slate-50'>
					${isFollowing ? 'following' : 'follow'}
				</button>
			`: ''}

		</div>
	`

	const element = stringToElement(htmlString)
	selector.insertAdjacentElement('beforeend', element)
	element.scrollIntoView({ behavior: 'smooth' })

	// element.classList.remove('active')
	if(isNoNotification) {
		element.classList.remove('message-success')
		element.classList.remove('message-notification')
	}
}


/*
elements.callingDialog({
	title : 'Incomming Audio Call', 			// string
	callSide: 'callee', 									// caller | callee
	error: '', 														// string
	onSuccess : (evt) => {
		evt.target.remove()
		console.log(evt.target)
	},
	onReject : (evt) => {
		evt.target.remove()
		console.log(evt.target)
	},
	onError : (evt) => {
		setTimeout(() => {
			evt.target.remove()
		})
	}
})

elements.callingDialog({
	title : 'Calling', 										// string
	callSide: 'caller', 									// caller | callee
	error: '', 														// string
	onSuccess : (evt) => {
		evt.target.remove()
		console.log(evt.target)
	},
	onReject : (evt) => {
		evt.target.remove()
		console.log(evt.target)
	},
	onError : (evt) => {
		setTimeout(() => {
			evt.target.remove()
		})
	}
})

elements.callingDialog({
	title : 'Not Found', 									// string
	callSide: 'caller', 									// caller | callee
	error: 'caller may be busy', 					// string
	onError : (evt) => {
		setTimeout(() => {
			evt.target.remove()
		}, 3000)
	}
})
*/
export const callingDialog = ( props = {}) => {
	const { 
		title='', 
		callSide='caller', 
		error='', 
		onSuccess=f=>f, 
		onReject=f=>f,
		onError=f=>f,
		user={ }
	} = props

	const htmlString = `
		<div name='calling-dialog' class='z-[100] flex backdrop-blur-sm h-screen fixed inset-0 justify-center items-center bg-blue-300/20'>
			<div class='w-[280px] p-8 flex flex-col gap-4 items-center bg-slate-50 rounded-md border border-slate-300 shadow-sm'>
				<p name='dialog-title' class='animate-pulse font-medium text-slate-800 capitalize'> 
					${title}
				</p>

				<div class='w-40 h-40 rounded-full bg-blue-600 p-8 text-slate-100'>
					<svg class='w-24 h-24' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path fill="currentColor" d="M230.93 220a8 8 0 0 1-6.93 4H32a8 8 0 0 1-6.92-12c15.23-26.33 38.7-45.21 66.09-54.16a72 72 0 1 1 73.66 0c27.39 8.95 50.86 27.83 66.09 54.16a8 8 0 0 1 .01 8"/></svg>
				</div>
				
				<div name='button-section' class='mt-2 flex gap-4 items-center'>

				${ callSide === 'callee' ? `
					<button name='call-accept' class='flex gap-2 items-center
						px-3 py-1.5 border border-blue-400 rounded-md text-blue-600
						hover:text-blue-700 hover:border-blue-500 hover:bg-blue-50
						active:text-blue-800 active:border-blue-600 active:bg-blue-100
					'>
						<svg class='pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 1024 1024"><path fill="currentColor" d="M1000.35 771.616c-15.664-11.008-187.059-124.974-208.066-137.806c-9.152-5.6-20.32-8.336-32.464-8.336c-15.664 0-33.008 4.56-49.935 13.472c-16.497 8.688-66.464 37.12-90.913 51.088c-21.536-15.12-72.127-53.872-151.84-133.664c-79.215-79.184-118.319-130.191-133.535-151.84c13.936-24.432 42.336-74.4 50.976-90.848c16.368-31.008 18.225-61.968 4.944-82.848c-12.463-19.68-125.968-191.808-137.68-208C240.813 7.554 221.021-.702 199.55-.702c-16.944 0-34.912 5.12-50.496 15.968C147.55 16.338-3.043 125.522-1.043 187.618C4.51 362.05 174.013 567.042 315.228 708.306s346.224 310.815 521.344 316.399h1.44c61.312 0 169.089-148.688 170.129-150.16c28.272-40.4 17.968-84.88-7.791-102.929m-44.209 65.651c-40.592 56.224-98.225 114.945-120.784 123.346c-120.032-5.632-288.464-111.12-474.88-297.568c-186.4-186.464-291.872-354.704-297.44-474.336c8.096-22.624 66.815-80.624 122.527-120.912c4.128-2.848 9.216-4.496 13.968-4.496c1.055 0 1.935.096 2.624.224c18 26.16 114.624 172.433 132.16 199.776c.064 2.88-.911 10.19-6.4 20.623c-5.84 11.12-24.032 43.536-49.904 88.88l-20.128 35.28l23.344 33.248c17.408 24.72 58.816 78.464 140.624 160.288c82.16 82.192 135.712 123.473 160.336 140.784l33.248 23.344l35.28-20.16c34.193-19.537 75.504-42.945 88.945-50c10.784-5.68 18.16-6.129 20.16-6.129c.32 0 .593 0 .816.033c24.496 15.376 173.937 114.592 200.32 132.688c.432 2.56.031 8.128-4.816 15.088zm-312.305-460.75c4.128 4.176 9.938 6.722 16.386 6.546l11.712-.273c.223 0 .383-.095.64-.11l229.503 1.007c12.912-.304 23.616-10.992 23.92-23.937l.016-16.416c-1.952-15.232-13.937-24.16-26.865-23.872l-151.504-.4l261.952-261.6c12.497-12.496 12.497-32.769 0-45.265c-12.496-12.48-32.752-12.48-45.248 0l-262.672 262.32l.88-154.833c.288-12.927-9.967-24.191-22.895-23.887l-16.416.015c-12.96.32-23.664 8.017-23.937 20.945l-.656 231.008c0 .223.88.383.88.607l-1.28 11.712c-.128 6.496 1.391 12.272 5.584 16.433"/></svg>
						<span class='pointer-events-none'> Accept </span>
					</button>
				` : ''}

				${error ? `
					<p name='dialog-message' class='mt-2 text-sm text-slate-600 max-w-52 truncate'>
						${error} 
					</p>

				` : `
					<button name='call-reject' class='flex gap-2 items-center
						px-3 py-1.5 border border-red-400 rounded-md text-red-600 
						hover:text-red-700 hover:border-red-500 hover:bg-red-50
						active:text-red-800 active:border-red-600 active:bg-red-100
					'>
						<svg class='pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M22.414 3L11.833 13.58c.508.441 1.049.846 1.617 1.211l1.86-1.859L22 14.42V23h-1a19.91 19.91 0 0 1-10.85-3.197a20.085 20.085 0 0 1-2.567-1.971L3 22.414L1.586 21L21 1.586zM9 16.415a18.069 18.069 0 0 0 2.237 1.71A17.892 17.892 0 0 0 20 20.972v-4.949l-4.053-.9l-2.174 2.175l-.663-.377A16.038 16.038 0 0 1 10.415 15zM1 2h8.58l1.487 6.69l-1.865 1.866l.297.504l-1.723 1.015l-1.084-1.839l2.184-2.183L7.976 4H3.027a17.893 17.893 0 0 0 3.097 9.138l.564.825l-1.652 1.128l-.564-.825A19.911 19.911 0 0 1 1 3z"/></svg>
						<span class='pointer-events-none'> Reject </span>
					</button>
				`} 

				</div>
			</div>
		</div>
	`

	const element = stringToElement(htmlString)
	document.body.insertAdjacentElement('afterbegin', element)

	const callAcceptButton = element.querySelector('[name=call-accept]')
	callAcceptButton?.addEventListener('click', () => {
		onSuccess({ target: element })
	})

	const callRejectButton = element.querySelector('[name=call-reject]')
	callRejectButton?.addEventListener('click', () => {
		onReject({ target: element })
	})

	if(error) {
		onError({ target: element })
	}

}


export const incommingCallDialog = ({ type='audio'} = {}) => new Promise((resolve, reject) => {

	callingDialog({
		title : `Incomming ${type} Call...`, 			// string
		callSide: 'callee', 									// caller | callee
		error: '', 														// string
		onSuccess : (evt) => {
			// evt.target.remove() 								// close dialog
			// console.log(evt.target)
			resolve(true)
		},
		onReject : (evt) => {
			// evt.target.remove() 								// close dialog
			// console.log(evt.target)
			resolve(false)
		},
		onError : (evt) => {
			setTimeout(() => {
				evt.target.remove()
			})
		}
	})
})  

export const calleeBusyCallDialog = () => { 		// on('call-error', {})
	callingDialog({
		title : 'Callee Busy', 									// string
		callSide: 'caller', 									// caller | callee
		error: 'Callee is currently busy', 					// string
		onError : (evt) => {
			setTimeout(() => {
				evt.target.remove()
			}, 3000)
		}
	})
}
export const calleeNotFoundDialog = () => { 		// on('call-error', {})
	callingDialog({
		title : 'Not Found', 									// string
		callSide: 'caller', 									// caller | callee
		error: 'caller not selected or online', 					// string
		onError : (evt) => {
			setTimeout(() => {
				evt.target.remove()
			}, 3000)
		}
	})
}

export const outGoingCallDialog = () => new Promise((resolve, reject) => { 
	callingDialog({
		title : 'Calling...', 								// string
		callSide: 'caller', 									// 'caller' | 'callee'
		error: '', 														// string
		onSuccess : (evt) => {
			// evt.target.remove()
			// console.log(evt.target)
			resolve(true)
			resolve({ status: 'success', element: evt.target })
		},
		onReject : (evt) => {
			evt.target.remove()
			// console.log(evt.target)
			resolve(false)
			resolve({ status: 'reject', element: evt.target })
		},
		onError : (evt) => {
			setTimeout(() => {
				evt.target.remove()
			}, 3000)
		}
	})
})

// home.js: showDragItemsInUI()
export const dropList = ({ fileName='filename.txt', fileSize='5.5 MB' }) => {
	const htmlString =`
		<div name='drop-list' class='flex items-center gap-1 px-2 py-1 border border-slate-200'>
			<span>
				<svg class='w-5 h-5' xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><path fill="currentColor" d="m210.83 85.17l-56-56A4 4 0 0 0 152 28H56a12 12 0 0 0-12 12v176a12 12 0 0 0 12 12h144a12 12 0 0 0 12-12V88a4 4 0 0 0-1.17-2.83M156 41.65L198.34 84H156ZM200 220H56a4 4 0 0 1-4-4V40a4 4 0 0 1 4-4h92v52a4 4 0 0 0 4 4h52v124a4 4 0 0 1-4 4"/></svg>
			</span>
			<p name='drop-text' class='flex-1 flex gap-2'> 
				<span class='text-slate-700 max-w-48 truncate'> ${fileName} </span>
				<span class=''> ( ${fileSize} ) </span>
			</p>
			<button name='close-button' class='p-0.5 border active:border-slate-300 rounded-full hover:text-slate-600 hover:scale-110'>
				<svg name='close' class='pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="m12 10.587l4.95-4.95l1.414 1.414l-4.95 4.95l4.95 4.95l-1.415 1.414l-4.95-4.95l-4.949 4.95l-1.414-1.415l4.95-4.95l-4.95-4.95L7.05 5.638z"/></svg>
				<svg name='tick' class='hidden pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m2.75 8.75l3.5 3.5l7-7.5"/></svg>
			</button>
		</div>
	` 

	const element = stringToElement( htmlString )
	const closeButton = element.querySelector('[name=close-button]')

	closeButton.addEventListener('click', (evt) => {
		element.remove()
	})
	return element
}




/*
elements.fileUploadDialog({
	type: 'file', 						// image | file = if image then preview, else show save button
	multiple: true,
	round: false,
	onSave: ({ dialog, files }) => {
		console.log(files)
		// dialog.remove()
	}
})
*/
export const fileUploadDialog = ( props = {}) => {
	const { 
		type='image',
		onSave=f=>f, 
		onCancel,

		multiple=true,
		round=true,

	} = props

	const htmlString = `
		<div name='image-upload-dialog' class='z-[100] flex backdrop-blur-sm h-screen fixed inset-0 justify-center items-center bg-blue-300/20'>
			<div class='w-4/5 sm:w-3/5  md:w-2/5 p-2 bg-slate-50 rounded-md border border-slate-300 shadow-sm'>

				<div name='drag-and-drop-container' class='relative'>

					<button name='close-button' class='
						ml-auto mr-1 mt-1 border text-slate-600 p-0.5 rounded-full
						hover:border-slate-300 hover:bg-slate-300
						active:border-slate-400/50 active:bg-slate-400/55
						absolute top-0 right-0
					'>
						<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32"><path fill="currentColor" d="M16 2C8.2 2 2 8.2 2 16s6.2 14 14 14s14-6.2 14-14S23.8 2 16 2m5.4 21L16 17.6L10.6 23L9 21.4l5.4-5.4L9 10.6L10.6 9l5.4 5.4L21.4 9l1.6 1.6l-5.4 5.4l5.4 5.4z"/></svg>
					</button>

					<div  name='drag-and-drop-content' class='flex-1 flex justify-center items-center text-slate-500 bg-slate-100 ' >
						<div name='drag-and-drop-container'
							class='min-h-48 bg-slate-50 border border-slate-200
							flex-1 flex flex-col justify-center items-center gap-1'
						>
							<span>
								<svg class='w-8 h-8' xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5c0-2.64-2.05-4.78-4.65-4.96M19 18H6c-2.21 0-4-1.79-4-4c0-2.05 1.53-3.76 3.56-3.97l1.07-.11l.5-.95A5.469 5.469 0 0 1 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5l1.53.11A2.98 2.98 0 0 1 22 15c0 1.65-1.35 3-3 3M8 13h2.55v3h2.9v-3H16l-4-4z"/></svg>
							</span>

							<p name='drop-text' class='text-slate-800 '>
								<span> Drag and drop ${type}s or </span>
								<input type='file' accept=${type === 'image' ? 'image/*' : '*'} multiple id='drag-and-drop-file' hidden />
								<label for='drag-and-drop-file' 
									class='underline decoration-dotted
									hover:text-slate-900 cursor-pointer'
									> Browse </label>
							</p>

							<p name='drop-text' class='text-xs'> Supported formats: JPG, JPEG, PNG</p>
							<p name='drop-text' class='text-xs'> File size: 5.5 MB</p>
						</div>
					</div>

					${ /* add flex/hidden to toggle button block */ ''}
					<div class='${type === 'image' ? 'hidden' : 'flex'} gap-2 justify-end items-center mt-2 '>
						<button hidden name='cancel-button' class='
							border border-slate-300/80 bg-slate-300/80 text-slate-600 px-5 py-1 rounded
							hover:border-slate-300 hover:bg-slate-300
							active:border-slate-400/50 active:bg-slate-400/55
						'>Cancel</button>

						<button name='save-button' class='
							text-xs border border-blue-500 bg-blue-500/80 text-slate-50 px-3 py-0.5 rounded
							hover:border-blue-600/90 hover:bg-blue-500/90
							active:border-blue-600 active:bg-blue-500
							disabled:border-slate-300/80 disabled:bg-slate-300/80
							disabled:text-slate-400
						'>Save</button>
					</div>
				</div>

			</div> 
		</div>
	`



	const element = stringToElement(htmlString)
	document.body.insertAdjacentElement('afterbegin', element)

	const dragAndDropContainer = element.querySelector('[name=drag-and-drop-container]')

	const dragAndDropContent = element.querySelector('[name=drag-and-drop-content]')
	const inputFile = element.querySelector('#drag-and-drop-file')
	const closeButton = element.querySelector('[name=close-button]')
	const cancelButton = element.querySelector('[name=cancel-button]')
	const saveButton = element.querySelector('[name=save-button]')

	let storeFiles = []

	saveButton.disabled = true

	// --- Drag and Drop ]---
	// NB: both 'dragover' and 'drop' event must preventDefault() else file open into browser
	dragAndDropContent.addEventListener('dragover', (evt) => {
		evt.preventDefault()
		evt.target.style.borderColor = '#2879e377'
	})
	dragAndDropContent.addEventListener('dragleave', (evt) => {
		evt.preventDefault()
		const rect = evt.target.getBoundingClientRect()
		if(
			evt.clientX > rect.left + rect.width || 
			evt.clientX < rect.left || 
			evt.clientY > rect.top + rect.height || 
			evt.clientY < rect.top
		) evt.target.removeAttribute('style')
	})
	dragAndDropContent.addEventListener('drop', (evt) => {
		evt.preventDefault() 		
		evt.target.removeAttribute('style')

		const files = [ ...evt.dataTransfer.files ]
		storeFiles= [] 		// clear old files (if have any)

		saveButton.disabled = !!storeFiles.length

		files.forEach( async (file) => {
			const dataUrl = await readAsDataURL(file, { type })

			storeFiles.push({ name: file.name, size: file.size, type: file.type, dataUrl })

			if(type === 'image') imagePreviewContent(storeFiles)
		})

	})
	// ---

	inputFile.addEventListener('change', (evt) => {
		const files = [ ...evt.target.files ]
		storeFiles= [] 		// clear old files (if have any)

		saveButton.disabled = !!storeFiles.length

		files.forEach( async (file) => {
			const dataUrl = await readAsDataURL(file, { type })
			storeFiles.push({ name: file.name, size: file.size, type: file.type, dataUrl })


			if(type === 'image') imagePreviewContent(storeFiles)
		})

	})

	const saveHandler = () => {
		onSave({ dialog: element, files: multiple ? storeFiles : [storeFiles[0]] })

		storeFiles= [] 		// clear old files (if have any)
	}

	const cancelHandler = () => {
		if(onCancel instanceof Function) return onCancel({ dialog: element })
		element.remove()
		storeFiles= [] 		// clear old files (if have any)
	}

	closeButton.addEventListener('click', cancelHandler)
	cancelButton.addEventListener('click', cancelHandler)
	saveButton.addEventListener('click', saveHandler)

	// if type === 'image' then preview

	const imagePreviewContent = (images) => {
		// if(!images.length) return
		dragAndDropContainer.innerHTML = '' 		// empty drag-and-drop content

		const imagePreViewHtmlString = `
			<div name='image-slider' class='relative flex-1 flex flex-col justify-center items-center text-slate-500 bg-slate-100 
				border border-slate-200 gap-1 
			'>

					<button name='close-button' class='
						ml-auto mr-1 mt-1 border text-slate-600 p-0.5 rounded-full
						hover:border-slate-300 hover:bg-slate-300
						active:border-slate-400/50 active:bg-slate-400/55
						absolute top-0 right-0
					'>
						<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32"><path fill="currentColor" d="M16 2C8.2 2 2 8.2 2 16s6.2 14 14 14s14-6.2 14-14S23.8 2 16 2m5.4 21L16 17.6L10.6 23L9 21.4l5.4-5.4L9 10.6L10.6 9l5.4 5.4L21.4 9l1.6 1.6l-5.4 5.4l5.4 5.4z"/></svg>
					</button>

				<img name='slide-preview' src='${images[0].dataUrl}' alt='${images[0].dataUrl}' 
					class='w-48 h-48 object-cover border-2 border-white ${round ? 'rounded-full' : ''}'
				/>

				<div name='slider-navigation-container' class='${multiple && images.length > 1 ? 'flex' : 'hidden'} w-full justify-center items-center border border-slate-200
						overflow-scroll
						h-12
					'
				>
					${images.map( image => (
						`
						<img name='slide-image' src='${image.dataUrl}' alt='${image.dataUrl}' 
							class='[&.active]:border-blue-400 [&.active]:scale-125 w-8 h-8 object-cover border border-slate-200 cursor-pointer'
						/>
						`
					))
				}
				</div>

				<div class='w-full mt-2 px-2 pb-1 flex justify-between items-center'>
					<button name='crop-button' class='
						text-xs border border-blue-500 text-blue-500/80 px-4 p-1 rounded
						hover:border-blue-600/90 hover:text-blue-500/90
						active:border-blue-600 active:text-blue-500
						disabled:border-slate-300/80 disabled:bg-slate-300/80
						disabled:text-slate-400
					'>Crop</button>

					<button name='done-button' class='
						text-xs border border-blue-500 bg-blue-500/80 text-slate-50 px-4 p-1 rounded
						hover:border-blue-600/90 hover:bg-blue-500/90
						active:border-blue-600 active:bg-blue-500
						disabled:border-slate-300/80 disabled:bg-slate-300/80
						disabled:text-slate-400
					'>Done</button>
				</div>
			</div>
		`



		let imagePreviewElement = stringToElement(imagePreViewHtmlString)

		dragAndDropContainer.insertAdjacentElement('afterbegin', imagePreviewElement)
		const slidePreview = dragAndDropContainer.querySelector('[name=slide-preview]')
		const sliderNavigationContainer = dragAndDropContainer.querySelector('[name=slider-navigation-container]')
		const closeButton = dragAndDropContainer.querySelector('[name=close-button]')
		const cropButton = dragAndDropContainer.querySelector('[name=crop-button]')
		const doneButton = dragAndDropContainer.querySelector('[name=done-button]')

		const firstSlideImage = dragAndDropContainer.querySelector('[name=slide-image]')
		firstSlideImage.classList.add('active')

		sliderNavigationContainer.addEventListener('click', (evt) => {
			if(evt.target.tagName !== 'IMG') return

			slidePreview.src = evt.target.src
			slidePreview.alt = evt.target.src
			
			const items =  Array.from(evt.currentTarget.children)

			items.forEach( (item) => {
				// evt.target.classList.toggle('active', evt.target.src === item.src ) 		// will not work
				item.classList.toggle('active', evt.target.src === item.src ) 						// will works
			})
		})


		closeButton.addEventListener('click', cancelHandler)
		doneButton.addEventListener('click', saveHandler)
		cropButton.addEventListener('click', (evt) => {
			imageCropContent(slidePreview)
		})
		// cropButton.click() // auto-click for testing

	}

	const imageCropContent = ({ src, alt }) => {
		dragAndDropContainer.innerHTML = '' 		// empty drag-and-drop content

		const cropImageHtmlString = `
			<div name='image-crop-container' class='relative flex-1 flex flex-col justify-center items-center text-slate-500 bg-slate-100 
				border border-slate-200 gap-1 
			'>

				<img name='crop-preview' src='${src}' alt='${alt}' 
					class='w-48 h-48 object-cover border-2 border-white ${round ? 'rounded-full' : ''}'
				/>

				<div class='w-full mt-2 px-2 pb-1 flex justify-end items-center'>
					<button name='done-button' class='
						text-xs border border-blue-500 bg-blue-500/80 text-slate-50 px-4 p-1 rounded
						hover:border-blue-600/90 hover:bg-blue-500/90
						active:border-blue-600 active:bg-blue-500
						disabled:border-slate-300/80 disabled:bg-slate-300/80
						disabled:text-slate-400
					'>Done</button>
				</div>
			</div>
		`


		const	cropElement = stringToElement(cropImageHtmlString)

		dragAndDropContainer.insertAdjacentElement('afterbegin', cropElement)
		const selectedImagePreview = dragAndDropContainer.querySelector('[name=crop-preview]')
		const doneButton = dragAndDropContainer.querySelector('[name=done-button]')

		const cropper = new Cropper(selectedImagePreview, { 
			aspectRatio : round ? 1/1 : 16/9
		})

		const doneButtonHandler = () => {
			cropCloseHandler() 								// defined bellow

			const canvas = cropper.getCroppedCanvas()
			const croppedDataUrl = canvas.toDataURL()

			const updatedImages = storeFiles.map( image => {
				return image.dataUrl === src ?  { ...image, dataUrl: croppedDataUrl } : image
			})
			imagePreviewContent(updatedImages)
			// imagePreviewContent([
			// 	{ 
			// 		// dataUrl: '/images/users/default.jpg', 
			// 		dataUrl: croppedDataUrl
			// 	},
			// 	{ dataUrl: '/images/logo.png', },
			// 	{ dataUrl: '/images/users/coverPhoto.png', },
			// ])
		}

		const cropCloseHandler = () => cropElement.remove() 			// hide crop dialog
		doneButton.addEventListener('click', doneButtonHandler)

	}

	// auto-show-image-previe for testing
	// imagePreviewContent([
	// 	{ dataUrl: '/images/users/default.jpg', },
	// 	{ dataUrl: '/images/users/coverPhoto.png', },
	// 	{ dataUrl: '/images/logo.png', },
	// ])
}
