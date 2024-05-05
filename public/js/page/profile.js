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



const goToMessageButton = $('[name=goto-message]')
const followUnfollowButton = $('[name=follow-unfollow]')
const coverPhotoEditButton = $('[name=cover-photo-edit-button]')
const avatarEditButton = $('[name=avatar-edit-button]')
const coverPhotoImg = $('[name=cover-photo]')
const avatarImg = $('[name=avatar]')
const tabsContainer = $('[name=tabs-container]')
const tabsContentContainer = $('[name=tabs-content-container]')
const followersContainer = $('[name=followers-container]')
const followingsContainer = $('[name=followings-container]')
const loadingContainer = $('[name=loading-container]')


const coverPhotoEditButtonHandler = (evt) => {
	elements.fileUploadDialog({ 
		multiple: false,
		type: 'image',
		round: false,
		onSave: async ({ dialog, files }) => {
			const coverPhoto = files[0].dataUrl

			const { message, data } = await http.updateUserPhotos(profileUser._id, { 
				coverPhoto,
				aspectRatio: 'video',
			})
			if(message) {
				// showError(message)
				dialog.remove()
				return
			}
			// console.log(data)
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
			const avatar = files[0].dataUrl

			const { message, data } = await http.updateUserPhotos(profileUser._id, { 
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
	// step-1: toggle follow/following
	const { message, data } = await http.toggleFollow(profileUser._id)
	if(message) return showError(message)
	// console.log(data)

	// step-2: if toggle success then update follow/following button style
	followFollowingHandler(evt) 	

	// step-3: if toggle success then update follow/following count value too
	console.log('update count value')
})


const tabs = Array.from(tabsContainer.children)
tabsContainer.addEventListener('click', (evt) => {
	if(	evt.target.tagName !== 'A' ) return

	tabs.forEach( tab => {
		tab.classList.toggle('active', tab.href === evt.target.href)
		tabsContentContainer.classList.toggle('active', tab.href === evt.target.href)
	})

	if(evt.target.href.includes('followers-tab') ) {
		// console.log('followers')
		showFollowersAndFollowingsList()
	}
	if(evt.target.href.includes('#followings-tab')) {
		// console.log('followints')
		showFollowersAndFollowingsList()
	}

})



const showFollowersAndFollowingsList = async () => {
	loadingContainer.classList.remove('hidden') 	// show loading container

	const { message, data } = await http.getFollowFollowing(profileUser._id)
	if(message) return showError(message)

	loadingContainer.classList.add('hidden') 	// hide loading container
	const { followers, followings } = data
	// console.log(data)

	followers.forEach( friend => {
		followersContainer.innerHTML = ''
		elements.createFirendList(followersContainer, {
			id: friend.id,
			avatar: friend.avatar,
			name: friend.fullName,
		})
	})
	followings.forEach( friend => {
		followingsContainer.innerHTML = ''
		elements.createFirendList(followingsContainer, {
			id: friend.id,
			avatar: friend.avatar,
			name: friend.fullName,
		})
	})
}
showFollowersAndFollowingsList() 	// get at first page load