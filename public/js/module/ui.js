import { Snackbar } from './components/index.js'
import { $, redirectTo } from './utils.js'
// import * as store from './store.js'
import { logout } from './http.js'

const middleTop = $('[name=middle-top]')
// const middleTopAvatar = middleTop.querySelector('[name=avatar]')
// const middleTopUsername = middleTop.querySelector('[name=username]')
// console.log(middleTopAvatar, middleTopUsername)

// const updateAvatar = (parentSelector) => {
// 	const avatar = parentSelector.querySelector('[name=avatar]')
// 	avatar.src = logedInUser.avatar
// }
// updateAvatar(middleTop)

// console.log(logedInUser)

export const showError = (message, reason) => {
	console.log(message)
	Snackbar({
		severity: 'error',
		message
	})
}


const getChatById = async (chatId) => {
	try {
		const res = await fetch('/api/users', {
			method: 'GET',
			headers: {
				'content-type': 'application/json'
			}
		})

		if(!res.ok) throw await res.json()

		const { status, data } = await res.json()
		console.log(data)

	} catch (err) {
		console.log(err)		
	}
}

// const getLogedInUser = async () => {
// 	try {
// 		const res = await fetch('/api/users', {
// 			method: 'GET',
// 			headers: {
// 				'content-type': 'application/json'
// 			}
// 		})

// 		if(!res.ok) throw await res.json()

// 		const { status, data } = await res.json()
// 		console.log(data)

// 	} catch (err) {
// 		console.log(err)		
// 	}
// }
// getLogedInUser()

const leftPanelAvatar = $('[name=left-top] [name=list-container] img')
leftPanelAvatar.style.cursor = 'pointer'
leftPanelAvatar.addEventListener('click', async (evt) => {
	// const img = evt.target
	// console.log(img)

	const { status, message } = await logout()
	if(status === 'success') return redirectTo('/login')
	
	Snackbar({
		severity: 'error', 											// success | info | warning | error
		message,
		// position: 'top-1 right-1' 						// tailwind class
		// variant: 'filled', 									// text | contained | filled
		// showSeverity: false,
		// action: true,
		// autoClose: true,
		// closeTime: 20000,
		// title: 'Testing'
	})
	
})


