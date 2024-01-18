import { stringToElement } from '/js/module/utils.js'


/*
$('div').addEventListener('click', (evt) => {

	Snackbar({
		severity: 'error', 											// success | info | warning | error
		message: 'notification update failed',
		// position: 'top-1 right-1' 						// tailwind class
		// variant: 'filled', 									// text | contained | filled
		// showSeverity: false,
		// action: true,
		// autoClose: true,
		// closeTime: 20000,
		// title: 'Testing'
	})

})
*/
export const Snackbar = (props={}) => {

	const {
		severity='success',
		variant='filled', 					// text | contained | filled
		title='',
		message='Snackbar message goes here',
		position='top-1 right-1',
		action=props.position || true,
		showSeverity=true,
		autoClose=false,
		closeTime = 10000,
	} = props

	const successHtmlString = `
		<div class="flex items-start gap-4 text-green-600 px-4 py-3 rounded border 
			${ variant === 'text' ? 'bg-green-100/50 border-green-100' : ''}
			${ variant === 'outlined' ? 'border-green-600' : ''}
			${ variant === 'filled' ? 'bg-green-500 text-white' : ''}
		">
			${showSeverity 
				? `
					<svg class=""  width="24" height="24" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="SuccessOutlinedIcon"><path fill="currentColor"  d="M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2, 4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0, 0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z"></path></svg> 
				`: ''}
			<div>
				${title ? ` <h1 class='${variant === 'filled' ? 'text-white' : 'text-green-900 '} font-semibold'> ${title} </h1> ` : ''} 
				<p class="${variant==='filled' ? '' : 'text-green-900'}">  ${message} </p>
			</div>

			${action ? `
				<button type='button' id='close' class=" ml-auto rounded-full p-0.5 ${ variant === 'filled' ? 'hover:bg-green-600/60 active:bg-green-600' : 'hover:bg-green-100 active:bg-green-200' } ">
					<svg class='w-5 h-5' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path fill="currentColor" d="M17.414 16L24 9.414L22.586 8L16 14.586L9.414 8L8 9.414L14.586 16L8 22.586L9.414 24L16 17.414L22.586 24L24 22.586z"/></svg>
				</button>
			`: ''}
		</div>
	`

	const infoHtmlString = `
		<div class=" flex items-start gap-4 text-sky-600 px-4 py-3 rounded border 
			${ variant === 'text' ? 'bg-sky-100/50 border-sky-100' : ''}
			${ variant === 'outlined' ? 'border-sky-600' : ''}
			${ variant === 'filled' ? 'bg-sky-500 text-white' : ''}
		">
			${showSeverity ? `
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11 17h2v-6h-2zm1-8q.425 0 .713-.288T13 8q0-.425-.288-.712T12 7q-.425 0-.712.288T11 8q0 .425.288.713T12 9m0 13q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12q0-3.35-2.325-5.675T12 4Q8.65 4 6.325 6.325T4 12q0 3.35 2.325 5.675T12 20m0-8"/></svg>
			` : '' }

			<div>
				${title ? ` <h1 class='${variant === 'filled' ? 'text-white' : 'text-sky-900 '} font-semibold'> ${title} </h1> ` : ''} 
				<p class="${variant==='filled' ? '' : 'text-sky-900'}"> ${message} </p>
			</div>

			${action ? `
				<button type='button' class=" ml-auto rounded-full p-0.5
					${ variant === 'filled' ? 'hover:bg-sky-600/60 active:bg-sky-600' : 'hover:bg-sky-100 active:bg-sky-200' }
				">
					<svg class='w-5 h-5' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path fill="currentColor" d="M17.414 16L24 9.414L22.586 8L16 14.586L9.414 8L8 9.414L14.586 16L8 22.586L9.414 24L16 17.414L22.586 24L24 22.586z"/></svg>
				</button>
			` : ''}
		</div>
	`

	const warningHtmlString = `
		<div class=" flex items-start gap-4 text-orange-600 px-4 py-3 rounded border 
			${ variant === 'text' ? 'bg-orange-100/50 border-orange-100' : ''}
			${ variant === 'outlined' ? 'border-orange-600' : ''}
			${ variant === 'filled' ? 'bg-orange-500 text-white' : ''}
		"> 
			${showSeverity ? `
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11.001 10h2v5h-2zM11 16h2v2h-2z"/><path fill="currentColor" d="M13.768 4.2C13.42 3.545 12.742 3.138 12 3.138s-1.42.407-1.768 1.063L2.894 18.064a1.986 1.986 0 0 0 .054 1.968A1.984 1.984 0 0 0 4.661 21h14.678c.708 0 1.349-.362 1.714-.968a1.989 1.989 0 0 0 .054-1.968L13.768 4.2zM4.661 19L12 5.137L19.344 19z"/></svg>
			` : ''}
			<div>
				${title ? ` <h1 class='${variant === 'filled' ? 'text-white' : 'text-orange-900 '} font-semibold'> ${title} </h1> ` : ''} 
				<p class="${variant==='filled' ? '' : 'text-orange-900'}"> ${message} </p>
			</div>
			${action ? `
				<button type='button' class=" ml-auto rounded-full p-0.5
					${ variant === 'filled' ? 'hover:bg-orange-600/60 active:bg-orange-600' : 'hover:bg-orange-100 active:bg-orange-200' }
				">
					<svg class='w-5 h-5' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path fill="currentColor" d="M17.414 16L24 9.414L22.586 8L16 14.586L9.414 8L8 9.414L14.586 16L8 22.586L9.414 24L16 17.414L22.586 24L24 22.586z"/></svg>
				</button>
			` : ''}
		</div>
	`

	const errorHtmlString = `
				<div class="
					flex items-start gap-4 px-4 py-3 rounded border 
					${ variant === 'text' ? 'bg-red-100/50 border-red-100' : ''}
					${ variant === 'outlined' ? 'border-red-600' : ''}
					${ variant === 'filled' ? 'bg-red-500 text-white' : ''}
				">
					${showSeverity ? `
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11 15h2v2h-2zm0-8h2v6h-2zm1-5C6.47 2 2 6.5 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 18a8 8 0 0 1-8-8a8 8 0 0 1 8-8a8 8 0 0 1 8 8a8 8 0 0 1-8 8"/></svg>
					` : ''}
					<div>
						${title ? ` <h1 class='${variant === 'filled' ? 'text-white' : 'text-red-900 '} font-semibold'> ${title} </h1> ` : ''} 
						<p class="${variant==='filled' ? 'text-white' : 'text-red-900'}"> ${message} </p>
					</div>

					${action ? `
						<button type='button' class=" ml-auto rounded-full p-0.5
							${ variant === 'filled' ? 'hover:bg-red-600/60 active:bg-red-600' : 'hover:bg-red-100 active:bg-red-200' }
						">
							<svg class='w-5 h-5' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path fill="currentColor" d="M17.414 16L24 9.414L22.586 8L16 14.586L9.414 8L8 9.414L14.586 16L8 22.586L9.414 24L16 17.414L22.586 24L24 22.586z"/></svg>
						</button>
					` : ''}
				</div>
	`

	let htmlString = successHtmlString
	if( severity === 'success') htmlString = successHtmlString
	if( severity === 'info') htmlString = infoHtmlString
	if( severity === 'warning') htmlString = warningHtmlString
	if( severity === 'error') htmlString = errorHtmlString


	const snackbarWrapper = `
		<div class="max-w-sm shadow-2xl z-50 absolute ${position} ">
			${htmlString}
		</div>
	`

	htmlString = position ? snackbarWrapper : htmlString
	// if( snackbar ) insertPosition = 'afterend'

	const element = stringToElement(htmlString)
	if( !element ) return console.error('element is null')
	const closeButton = element.querySelector('button')

	document.body.insertAdjacentElement('beforebegin', element)

	const closeHandler = () => element.remove()
	if( autoClose ) setTimeout(closeHandler, closeTime);
	closeButton?.addEventListener('click', closeHandler)
}

