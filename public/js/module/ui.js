import { Snackbar } from './components/index.js'
import { $ } from './utils.js'
import * as store from './store.js'

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