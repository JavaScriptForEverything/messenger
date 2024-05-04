import { $, followFollowingHandler, redirectTo, showError } from '../module/utils.js'
import * as elements from '../module/elements.js'
import * as http from '../module/http.js'
import * as store from '../module/store.js'
import '../plugins/cropper/cropper.min.js' 			// Cropper class will be available

/* Global Variables
		. logedInUser
		. profileUser
*/

// console.log(profileUser)

store.setLogedInUser(logedInUser)

// elements.fileUploadDialog({
// 	// type: 'file', 						// image | file = if image then preview, else show save button
// 	multiple: true,
// 	round: false,
// 	onSave: ({ dialog, files }) => {
// 		console.log(files)
// 		dialog.remove()
// 	}
// })


const goToMessageButton = $('[name=goto-message]')
const followUnfollowButton = $('[name=follow-unfollow]')
const coverPhotoEditButton = $('[name=cover-photo-edit-button]')
const avatarEditButton = $('[name=avatar-edit-button]')
const coverPhotoImg = $('[name=cover-photo]')
const avatarImg = $('[name=avatar]')


const coverPhotoEditButtonHandler = (evt) => {
	elements.fileUploadDialog({ 
		multiple: false,
		type: 'image',
		round: false,
		onSave: async ({ dialog, files }) => {
			const { logedInUserId } = store.getState()
			const coverPhoto = files[0].dataUrl

			const { message, data } = await http.updateUserPhotos(logedInUserId, { 
				coverPhoto,
				aspectRatio: 'video',
			})
			if(message) {
				// ui.showError(message)
				dialog.remove()
				return
			}
			console.log(data)
			coverPhotoImg.src = data.coverPhoto
			dialog.remove()

		}
	})
}
const avatarEditButtonHandler = (evt) => {
	elements.fileUploadDialog({ 
		multiple: false,
		type: 'image',
		round: true,
		onSave: async ({ dialog, files }) => {
			const { logedInUserId } = store.getState()
			const avatar = files[0].dataUrl

			const { message, data } = await http.updateUserPhotos(logedInUserId, { 
				avatar,
				aspectRatio: 'square',
			})
			if(message) {
				showError(message)
				dialog.remove()
				return
			}
			console.log(data)
			avatarImg.src = data.avatar
			dialog.remove()
		}
	})
}

const goToMessageButtonHandler = (evt) => {
	const url = new URL(location.href)
	const userId = url.pathname.split('/').pop()

	redirectTo(`/#userId=${userId}`)
}


coverPhotoEditButton.addEventListener('click', coverPhotoEditButtonHandler)
avatarEditButton.addEventListener('click', avatarEditButtonHandler)
goToMessageButton.addEventListener('click', goToMessageButtonHandler)
followUnfollowButton.addEventListener('click', async (evt) => {
	// call http
	const { message, data } = await http.toggleFollow(profileUser._id)
	if(message) return showError(message)
	// console.log(data)
	followFollowingHandler(evt)
})





