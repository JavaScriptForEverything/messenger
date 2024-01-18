import { encodeHTML, stringToElement } from './utils.js'
// export const getIncommingCallDialog = (exactCallType, acceptCallHandler, rejectCallHandler) => {
// }


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