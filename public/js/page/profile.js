// import { Snackbar, getTweetHTML } from '/js/module/components/index.js'
// import $, { axios } from '/js/module/utils.js'

import { $, followFollowingHandler, redirectTo } from '../module/utils.js'
import * as elements from '../module/elements.js'
import '../plugins/cropper/cropper.min.js'

/* Global Variables
		. logedInUser
		. profileUser
		. Cropper 		from cropper above plugin
*/

// console.log('profile page')
// console.log(logedInUser)


elements.imageUploadDialog({
	multiple: true,
	onSave: ({ dialog, files }) => {
		console.log(files)
		// dialog.remove()
	}
})


const goToMessageButton = $('[name=goto-message]')
const followUnfollowButton = $('[name=follow-unfollow]')
const coverPhotoEditButton = $('[name=cover-photo-edit-button]')
const avatarEditButton = $('[name=avatar-edit-button]')


const coverPhotoEditButtonHandler = (evt) => {
	console.log('cover photo edit button handler')

	elements.imageUploadDialog({ 
		onSave: ({ dialog, files }) => {
			dialog.remove()
			console.log(files)
		},
		onCancel: ({ dialog }) => {
			dialog.remove()
		}
	})
}
const avatarEditButtonHandler = (evt) => {
	console.log('avatar photo edit button handler')

	elements.imageUploadDialog({ 
		onSave: ({ dialog, files }) => {
			dialog.remove()
			console.log(files)
		},
		onCancel: ({ dialog }) => {
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
followUnfollowButton.addEventListener('click', followFollowingHandler)







// avatarEditButton.addEventListener('click', (evt) => {

// 	const uploadProfilePictureDialog = `
// 		<dialog open=false name="avatar-dialog" class="opacity-0 z-10 w-2/3 md:max-w-md text-slate-700 rounded border border-slate-300 shadow">
// 			<div class="flex flex-col divide-y">

// 				<div class="flex justify-between items-center px-4 py-2 " id="header">
// 					<h1 class="font-semibold text-slate-800">Profile Picture</h1> 
// 					<button name='dialog-close-button' class="p-1 rounded-full" type="button">
// 						<svg class='w-3 h-3 pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M2.93 17.07A10 10 0 1 1 17.07 2.93A10 10 0 0 1 2.93 17.07zM11.4 10l2.83-2.83l-1.41-1.41L10 8.59L7.17 5.76L5.76 7.17L8.59 10l-2.83 2.83l1.41 1.41L10 11.41l2.83 2.83l1.41-1.41L11.41 10z"/></svg>
// 					</button>
// 				</div>

// 				<div class="px-4 py-2">
// 					<input type="file" name="avatar-file" accept='image/*'>
// 					<div class="flex justify-center mt-1 rounded shadow">
// 						<img 
// 							name='image-preview' 
// 							class='block max-w-full' 
// 							src="${logedInUser.avatar || '/images/users/default.jpg'}" 
// 							alt="image-preview"
// 						>
// 					</div>
// 				</div>
				

// 				<div class="px-4 py-3 my-1 flex justify-end items-end gap-2" id="footer">
// 					<button name='dialog-cancel-button' class="disabled:bg-slate-500/50 disabled:text-slate-600 px-2 py-1 bg-slate-500 text-slate-100 rounded-md text-sm border border-slate-500 hover:bg-slate-600 hover:text-white" type="button">Cancel</button> 
// 					<button name='dialog-submit-button' class="disabled:bg-slate-500/50 disabled:text-slate-600 disabled:border-slate-500 px-2 py-1 bg-blue-500 text-slate-100 rounded-md text-sm border border-blue-500 hover:bg-blue-600 hover:text-white" type="submit">Save</button>
// 				</div>

// 			</div>
// 		</dialog>
// 	`
// 	document.body.insertAdjacentHTML('afterbegin', uploadProfilePictureDialog)


// 	let cropper;
// 	let timer = 0

// 	const dialog = $('[name=avatar-dialog]')
// 	const closeButton = $('[name=dialog-close-button]')
// 	const cancelButton = $('[name=dialog-cancel-button]')
// 	const submitButton = $('[name=dialog-submit-button]')
// 	const avatarFile = $('[name=avatar-file]') 		// input:file
// 	const avatar = $('[name=avatar]') 						// To show avatar in UI
// 	const image = $('[name=image-preview]') 			// To show avatar in Dialog

// 	dialog.style.transition = 'opacity 0.5s ease-out'
// 	setTimeout(() => dialog.style.opacity = 1, 0)

// 	const closeHandler = () => {
// 		clearTimeout( timer ) 	
// 		// remove 500ms delay if user click quickly so that next time transition works properly

// 		dialog.style.opacity = 0
// 		timer = setTimeout(() => dialog.close(), 500)
// 	}
// 	closeButton.addEventListener('click', closeHandler )
// 	cancelButton.addEventListener('click', closeHandler)

// 	avatarFile.addEventListener('change', (evt) => {
// 		const ImageFile = evt.target.files[0]
// 		if(!ImageFile.type.match('image/*')) console.log('it is not image')

// 		const reader = new FileReader()
// 		reader.readAsDataURL(ImageFile)

// 		reader.addEventListener('loadend', () => {
// 			image.src = reader.result

// 			cropper = new Cropper(image, {
// 				aspectRatio: 1/1,
// 				background: false
// 			})
// 		})

// 	})

// 	submitButton.addEventListener('click', () => {
// 		if(!cropper) return console.log('please choose image and save that')

// 		const canvas = cropper.getCroppedCanvas()
// 		canvas.toBlob( async (blob) => {
// 			const formData = new FormData()
// 			formData.append('avatar', blob)

// 			try {
// 				// Don't Send headers, else in backend file will not be caputed by Multer
// 				const res = await fetch('/api/users/avatar', {
// 					method: 'POST',
// 					body: formData
// 				})
// 				if(!res.ok) throw res.json()

// 				const data = await res.json()
// 				const user = data.data
// 				avatar.src = user.avatar

// 				closeHandler()

// 			} catch (error) {
// 				// Snackbar({
// 				// 	severity: 'error',
// 				// 	variant: 'filled',
// 				// 	message: error.message || '',
// 				// 	action: true,
// 				// })
// 				closeHandler()
// 			}
// 		})
// 	})

// })





/*
const tabContainer = $('[name=tab-container]')
const tweetTab = tabContainer.children[0]
const repliesTab = tabContainer.children[1]

const followingButton = $('#following-button')
const tweetsContentContainer = $('[name=tweets-container]')
const repliesContentContainer = $('[name=replies-container]')
const loadingContainer = $('[name=loading-container]')
const notFoundChild = loadingContainer.children[0]
const loadingChild = loadingContainer.children[1]
const followersSpan = $('#followers')

//-----[ Tabs container ]-----
tweetTab.classList.add('tab-active')
if(location.hash === '#replies-tab') { 
	repliesTab.classList.add('tab-active')
	tweetTab.classList.remove('tab-active')
}

tabContainer.addEventListener('click', (evt) => {
	// Step-1: add active tab style
	Array.from(evt.currentTarget.children).forEach( (tab, index) => {
		tab.classList.toggle('tab-active', +evt.target.id === index)
	}) 

	// Step-2: Show Active Tab content
	Array.from( document.querySelectorAll('.tab-item') ).forEach((tabItem, index) => {
		tabItem.hidden = evt.target.id !== index.toString()
	})
})
// ---------





const activeTab = location.hash === '#replies-tab' ? 'replies' : 'tweets' 
if(activeTab === 'replies') {
	tweetsContentContainer.hidden = true
	repliesContentContainer.hidden = false
}


// -------[ avatar ]-------
$('[name=avatar-container]').addEventListener('click', (evt) => {

	const uploadProfilePictureDialog = `
		<dialog open=false name="avatar-dialog" class="opacity-0 z-10 w-2/3 md:max-w-md text-slate-700 rounded border border-slate-300 shadow">
			<div class="flex flex-col divide-y">

				<div class="flex justify-between items-center px-4 py-2 " id="header">
					<h1 class="font-semibold text-slate-800">Profile Picture</h1> 
					<button name='dialog-close-button' class="p-1 rounded-full" type="button">
						<svg class='w-3 h-3 pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M2.93 17.07A10 10 0 1 1 17.07 2.93A10 10 0 0 1 2.93 17.07zM11.4 10l2.83-2.83l-1.41-1.41L10 8.59L7.17 5.76L5.76 7.17L8.59 10l-2.83 2.83l1.41 1.41L10 11.41l2.83 2.83l1.41-1.41L11.41 10z"/></svg>
					</button>
				</div>

				<div class="px-4 py-2">
					<input type="file" name="avatar-file" accept='image/*'>
					<div class="flex justify-center mt-1 rounded shadow">
						<img 
							name='image-preview' 
							class='block max-w-full' 
							src="${logedInUser.avatar || '/images/users/default.jpg'}" 
							alt="image-preview"
						>
					</div>
				</div>
				

				<div class="px-4 py-3 my-1 flex justify-end items-end gap-2" id="footer">
					<button name='dialog-cancel-button' class="disabled:bg-slate-500/50 disabled:text-slate-600 px-2 py-1 bg-slate-500 text-slate-100 rounded-md text-sm border border-slate-500 hover:bg-slate-600 hover:text-white" type="button">Cancel</button> 
					<button name='dialog-submit-button' class="disabled:bg-slate-500/50 disabled:text-slate-600 disabled:border-slate-500 px-2 py-1 bg-blue-500 text-slate-100 rounded-md text-sm border border-blue-500 hover:bg-blue-600 hover:text-white" type="submit">Save</button>
				</div>

			</div>
		</dialog>
	`
	$('#forModalContainer').insertAdjacentHTML('afterbegin', uploadProfilePictureDialog)


	let cropper;
	let timer = 0

	const dialog = $('[name=avatar-dialog]')
	const closeButton = $('[name=dialog-close-button]')
	const cancelButton = $('[name=dialog-cancel-button]')
	const submitButton = $('[name=dialog-submit-button]')
	const avatarFile = $('[name=avatar-file]') 		// input:file
	const avatar = $('[name=avatar]') 						// To show avatar in UI
	const image = $('[name=image-preview]') 			// To show avatar in Dialog

	dialog.style.transition = 'opacity 0.5s ease-out'
	setTimeout(() => dialog.style.opacity = 1, 0)

	const closeHandler = () => {
		clearTimeout( timer ) 	
		// remove 500ms delay if user click quickly so that next time transition works properly

		dialog.style.opacity = 0
		timer = setTimeout(() => dialog.close(), 500)
	}
	closeButton.addEventListener('click', closeHandler )
	cancelButton.addEventListener('click', closeHandler)

	avatarFile.addEventListener('change', (evt) => {
		const ImageFile = evt.target.files[0]
		if(!ImageFile.type.match('image/*')) console.log('it is not image')

		const reader = new FileReader()
		reader.readAsDataURL(ImageFile)

		reader.addEventListener('loadend', () => {
			image.src = reader.result

			cropper = new Cropper(image, {
				aspectRatio: 1/1,
				background: false
			})
		})

	})

	submitButton.addEventListener('click', () => {
		if(!cropper) return console.log('please choose image and save that')

		const canvas = cropper.getCroppedCanvas()
		canvas.toBlob( async (blob) => {
			const formData = new FormData()
			formData.append('avatar', blob)

			try {
				// Don't Send headers, else in backend file will not be caputed by Multer
				const res = await fetch('/api/users/avatar', {
					method: 'POST',
					body: formData
				})
				if(!res.ok) throw res.json()

				const data = await res.json()
				const user = data.data
				avatar.src = user.avatar

				closeHandler()

			} catch (error) {
				Snackbar({
					severity: 'error',
					variant: 'filled',
					message: error.message || '',
					action: true,
				})
				closeHandler()
			}
		})
	})

})

// -------[ cover photo ]-------
$('[name=edit-cover-photo-container]')?.addEventListener('click', (evt) => {

	const uploadCoverPhotoDialog = `
		<dialog open=false name="coverPhoto-dialog" class="opacity-0 z-10 w-2/3 md:max-w-md text-slate-700 rounded border border-slate-300 shadow">
			<div class="flex flex-col divide-y">

				<div class="flex justify-between items-center px-4 py-2 " id="header">
					<h1 class="font-semibold text-slate-800">Cover Photo</h1> 
					<button name='dialog-close-button' class="p-1 rounded-full" type="button">
						<svg class='w-3 h-3 pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M2.93 17.07A10 10 0 1 1 17.07 2.93A10 10 0 0 1 2.93 17.07zM11.4 10l2.83-2.83l-1.41-1.41L10 8.59L7.17 5.76L5.76 7.17L8.59 10l-2.83 2.83l1.41 1.41L10 11.41l2.83 2.83l1.41-1.41L11.41 10z"/></svg>
					</button>
				</div>

				<div class="px-4 py-2">
					<input type="file" name="coverPhoto-file" accept='image/*'>
					<div class="flex justify-center mt-1 rounded shadow">
						<img 
							name='image-preview' 
							class='block max-w-full' 
							src="${logedInUser.coverPhoto || '/images/users/coverPhoto.png'}" 
							alt="missing user coverPhoto"
						>
					</div>
				</div>
				

				<div class="px-4 py-3 my-1 flex justify-end items-end gap-2" id="footer">
					<button name='dialog-cancel-button' class="disabled:bg-slate-500/50 disabled:text-slate-600 px-2 py-1 bg-slate-500 text-slate-100 rounded-md text-sm border border-slate-500 hover:bg-slate-600 hover:text-white" type="button">Cancel</button> 
					<button name='dialog-submit-button' class="disabled:bg-slate-500/50 disabled:text-slate-600 disabled:border-slate-500 px-2 py-1 bg-blue-500 text-slate-100 rounded-md text-sm border border-blue-500 hover:bg-blue-600 hover:text-white" type="submit">Save</button>
				</div>

			</div>
		</dialog>
	`
	$('#forModalContainer').insertAdjacentHTML('afterbegin', uploadCoverPhotoDialog)

	let cropper;
	let timer = 0

	const dialog = $('[name=coverPhoto-dialog]')
	const closeButton = $('[name=dialog-close-button]')
	const cancelButton = $('[name=dialog-cancel-button]')
	const submitButton = $('[name=dialog-submit-button]')
	const coverPhotoFile = $('[name=coverPhoto-file]') 			// input:file
	const image = $('[name=image-preview]') 								// To show image preview in Modal
	const coverPhoto = $('[name=cover-photo]') 							// To show image in UI


	dialog.style.transition = 'opacity 0.5s ease-out'
	setTimeout(() => dialog.style.opacity = 1, 0)

	const closeHandler = () => {
		clearTimeout( timer ) 	
		// remove 500ms delay if user click quickly so that next time transition works properly

		dialog.style.opacity = 0
		timer = setTimeout(() => dialog.close(), 500)
	}
	closeButton.addEventListener('click', closeHandler)
	cancelButton.addEventListener('click', closeHandler)

	coverPhotoFile.addEventListener('change', (evt) => {
		const ImageFile = evt.target.files[0]
		if(!ImageFile.type.match('image/*')) console.log('it is not image')

		const reader = new FileReader()
		reader.readAsDataURL(ImageFile)

		reader.addEventListener('loadend', () => {
			image.src = reader.result

			cropper = new Cropper(image, {
				aspectRatio: 16/9,
				background: false
			})
		})

	})

	submitButton.addEventListener('click', () => {
		if(!cropper) return console.log('please choose image and save that')

		const canvas = cropper.getCroppedCanvas()
		canvas.toBlob( async (blob) => {
			const formData = new FormData()
			formData.append('coverPhoto', blob)

			try {
				// Don't Send headers, else in backend file will not be caputed by Multer
				const res = await fetch('/api/users/cover-photo', {
					method: 'POST',
					body: formData
				})
				if(!res.ok) throw res.json()

				const data = await res.json()
				const user = data.data
				coverPhoto.src = user.coverPhoto || blob 	

				closeHandler()

			} catch (error) {
				Snackbar({
					severity: 'error',
					variant: 'filled',
					message: error.message || 'toggle following failed',
					action: true,
				})
				closeHandler()
			}
		})
	})

})



// PATCH /api/users/:id/following
followingButton.addEventListener('click', async (evt) => {
	followingButton.disabled = true

	const { data, error } = await axios({ 
		url: `/api/users/${profileUser._id}/following`, 
		method: 'PATCH'
	})
	if(error) {
		Snackbar({
			severity: 'error',
			variant: 'filled',
			message: error.message || 'toggle following failed',
			action: true,
		})

		return console.log(`toggle following failed: ${error.message}`)
	}

	const updatedProfileUser = data.data

	followingButton.disabled = false
	const isFollowed = followingButton.textContent === 'follow'
	followingButton.textContent = isFollowed ? 'following' : 'follow'
	followingButton.classList.toggle('follow-active', isFollowed)

	// logedInUser is the followers, and profile users are following
		$('#followers').textContent = updatedProfileUser.followers.length 

})








// GET /api/tweets
const fetchAllTweets = async () => {
	const { data, error } = await axios({ url: `/api/tweets?mine=${profileUser._id}` })

	if(error) {
		notFoundChild.classList.remove('hidden')
		loadingChild.classList.add('hidden')

		if(activeTab === 'replies') {
			notFoundChild.textContent = notFoundChild.textContent.replace('tweets', 'replies')
		}

		Snackbar({
			severity: 'error',
			variant: 'filled',
			message: error.message || 'toggle following failed',
			action: true,
		})

		return console.log(`GET /api/tweets failed: ${error.message}`)
	}

	loadingContainer.remove()

	data.data?.forEach( (tweet) =>  {
		// Tweets-Tab: 
		if( tweet.replyTo === undefined) {
			tweetsContentContainer.insertAdjacentHTML('beforeend', getTweetHTML(tweet, profileUser, { 
				showIcons: false,
				showPinLabel: false
			}))
		}

		// Replies-Tab: 
		if( tweet.replyTo !== undefined) {
			const reply = tweet
			repliesContentContainer.insertAdjacentHTML('beforeend', getTweetHTML(reply, profileUser, { 
				showIcons: false,
				showPinLabel: false
			}))
		}
	})
}
fetchAllTweets()

*/

