import { decodeHTML } from '../utils.js'


/*
const listHtmlString =	List({
	isHover: true,
	primary: 'List primary',
	secondary: 'list summary goes here',
	avatar: '/images/users/default.jpg',
	images: ['/images/users/default.jpg', '/images/users/default.jpg'],
	icon: `
		<svg class='w-3 h-3 pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m6.4 18.308l-.708-.708l5.6-5.6l-5.6-5.6l.708-.708l5.6 5.6l5.6-5.6l.708.708l-5.6 5.6l5.6 5.6l-.708.708l-5.6-5.6l-5.6 5.6Z"/></svg>
	`
})

const listWrapper = `
	<a href='/tweet/tweetId/'>
		${listHtmlString}
	</a>
`
document.querySelector('#container').insertAdjacentHTML('beforeend', listWrapper )
*/
export const List = (props = {}) => {

	const {
		primary='',
		secondary='',
		avatar= '',
		images=[],
		icon= '',
		isHover= false,
		isActive=false,
		id='',
		name='list-container',
	} = props

	const imageSize = (primary && secondary) ? 'w-12 h-12' : 'w-8 h-8'

	const htmlString = `
	<div
		class=" group border-b border-slate-200 px-3 py-1.5 rounded-sm  
			${isHover ? 'hover:bg-slate-100 active:bg-slate-200' : ''}
			${isActive ? 'bg-slate-200 border-slate-300' : 'bg-slate-50'}
		"
		id=${id}
		name=${name}
		>
		<div class='flex gap-2 items-center '>
			${ images.length ? `
				<div class='relative w-8 h-8'>
					<img src=${images[0]} alt="images[0]" class='absolute -top-1 left-3 w-8 h-8 rounded-full border border-slate-300' />
					<img src=${images[1]} alt="images[1]" class='absolute top-2 left-0 w-8 h-8 rounded-full border border-slate-300' />
				</div>
			` : `
				${avatar ? `
					<img src=${avatar} alt="avatar" class='${imageSize} rounded-full border border-slate-300' />
				` : ''}
			`}

			<div class=${images.length ? 'ml-4' : ''}>
				${primary ? `
					<h2 class='text-slate-700 font-medium hover:text-slate-800 truncate w-60'> ${primary} </h2>
				` : ''}
				${secondary ? `
					<p class='text-slate-700/95 hover:text-slate-800/90 font-light text-sm truncate w-60'> 
						${decodeHTML(secondary)} 
					</p>
				` : ''}
			</div>

			${icon ? `
			<button type='button' name='list-icon' 
				class="
					ml-auto p-0.5 text-slate-600 rounded-full bg-slate-200 border border-slate-200
				group-hover:bg-slate-300 group-hover:border-slate-300 hover:bg-slate-300 hover:border-slate-300 hover:text-slate-700
				group-active:border-slate-400 active:bg-blue-400 active:border-blue-500 active:text-blue-600
				"
			> 
				${icon}
			</button>
			` :''}
		</div>
	</div>
	`

	return htmlString
}

