const { isValidObjectId } = require('mongoose')
const { apiFeatures } = require('../utils')
const { catchAsync, appError } = require('./errorController')
const User = require('../models/userModel')
const userDto = require('../dtos/userDto')
const fileService = require('../services/fileService')
const slug = require('slug')

// GET /api/users
exports.getAllUsers = catchAsync( async (req, res, next) => {
	// const users = await User.find()
	const filter = {}
	const users = await apiFeatures(User, req.query, filter)

	res.status(200).json({
		status: 'success',
		count: users.length,
		data: users
		// data: users.map( user => userDto.filterUser(user._doc))
	})
})


// GET /api/users/friends + protect
exports.getAllFriends = catchAsync( async (req, res, next) => {
	const logedInUserId = req.userId

	// // friends = followers + followings
	// const filter = { _id: { $ne: logedInUserId }}
	// const users = await apiFeatures(User, req.query, filter).populate('latestMessage')
	// // filter users fields and instead of populate user populate frields virtual property of followers + followings

	const logedInUser = await User.findById(logedInUserId)
	const filter = { 
		$and: [
			{ _id: { $ne: logedInUserId }, },
			{ _id: { $in: logedInUser.followings } }
		]
	}
	// get those users who are in followings 
	// const users = await apiFeatures(User, req.query, filter).populate('latestMessage')


	const users = await User.find( filter )
		.select('firstName lastName avatar latestMessage')
		.populate('latestMessage')
		.populate('notifications') 			// virtual Property



	// setTimeout(() => {
	// if(true)return next(appError('no friends found'))

	res.status(200).json({
		status: 'success',
		count: users.length,
		data: users
		// data: users.map( user => userDto.filterUser(user._doc))
	})

	// }, 500)
})




// POST /api/users/filtered-users + protect
exports.getFilteredUsers = catchAsync( async (req, res, next) => {
	const { userIds = [] } = req.body

	// filter self user to show in friendList
	const filteredUserIds = userIds.filter( userId => userId !== req.userId )

	const filter = { _id: { $in: filteredUserIds } }
	const users = await apiFeatures(User, req.query, filter)

	// if(true) return next(appError('error'))

	res.status(200).json({
		status: 'success',
		count: users.length,
		data: users 	
	})
})



// GET /api/users/:id 		: id can by id or username slug
exports.getUserById = catchAsync( async (req, res, next) => {
	const userId = req.params.id
	let filter = isValidObjectId(userId) ? { _id: userId } : { username: userId }

	const user = await User.findOne(filter)
	if(!user) return next(appError('user not found'))

	res.status(200).json({
		status: 'success',
		data: user 	
	})
})

// PATCH /api/users/:id
exports.updateUserById = catchAsync( async (req, res, next) => {
	const userId = req.params.id
	if( !isValidObjectId(userId) ) return next(appError(`userId: ${userId} is invalid, please provide valid Id`))

	const filteredBody = userDto.filterBodyForUpdate(req.body)
	// console.log({ filteredBody })
	if(filteredBody.username) {
		filteredBody.username = slug(filteredBody.username, '-')
	}

	// const user = await User.findById(userId)
	const user = await User.findByIdAndUpdate(userId, filteredBody, { new: true })
	if(!user) return next(appError('user update failed'))

	res.status(200).json({
		status: 'success',
		data: user 	
	})
})

// PATCH /api/users/:id/photos + protected
exports.updateUserPhotos = catchAsync( async (req, res, next) => {
	const logedInUserId = req.userId
	const userId = req.params.id 			// profileUser.id
	if( !isValidObjectId(userId) ) return next(appError(`userId: ${userId} is invalid, please provide valid Id`))

	if( logedInUserId !== userId ) {
		return next(appError('sorry only logedInUser can update his photos'))
	} 


	const { avatar, coverPhoto } = req.body

	const filteredBody = {}
	if(avatar) filteredBody.avatar = avatar
	if(coverPhoto) filteredBody.coverPhoto = coverPhoto

	// Step-1: file user, and get old image
	const user = await User.findById(userId).select('avatar coverPhoto')
	if(!user) return next(appError('user not found', 404))


	// Step-2: add update photo: avatar | coverPhoto
	/* Step-3: Delete old image
			- make sure take old image into a variable, instead of object property
				because object properties has value by reference, means they point to same location
				into memory, so if try to delete image as object property that will delete same image

				Example:
						const previousCoverPhoto = user.coverPhoto 	// make a copy of old coverPhoto, else object has reference value

						user.coverPhoto = url
						updatedUser = await user.save() 								// save changes

				(1)	fileService.removeFile(user.coverPhoto, '/users') 		// Because of object reference, it will delete update avatar.
				(2)	fileService.removeFile(previousCoverPhoto, '/users') 	// (Right Way) remove old image
	*/ 

	// const updatedUser = await User.findByIdAndUpdate(userId, filteredBody, { new: true })
	// if(!updatedUser) return next(appError('user update failed'))

	let updatedUser = null

	if(coverPhoto) {
		const previousCoverPhoto = user.coverPhoto 	// make a copy of old coverPhoto, else object has reference value

		try {
			const { error, url } = await fileService.handleBase64File(coverPhoto, '/users')
			if(error) throw new Error(url)

			user.coverPhoto = url
			updatedUser = await user.save() 								// save changes
			if(!updatedUser) return next(appError('coverPhoto update failed', 404))

			// fileService.removeFile(user.coverPhoto, '/users') 	// Because of object reference, it will delete update avatar.
			fileService.removeFile(previousCoverPhoto, '/users') 	// remove old image

		} catch (error) {
			setTimeout(() => {
				fileService.removeFile(error.message) 				// if image upload failed
			}, 1000);
		}
	}

	if(avatar) {
		const previousAvatar = user.avatar 	// make a copy of old avatar, else object has reference value

		try {
			const { error, url } = await fileService.handleBase64File(avatar, '/users')
			if(error) throw new Error(url)

			user.avatar = url
			updatedUser = await user.save() 								// save changes
			if(!updatedUser) return next(appError('avatar update failed', 404))

			// fileService.removeFile(user.avatar, '/users') 	// Because of object reference, it will delete update avatar.
			fileService.removeFile(previousAvatar, '/users') 	// remove old image


		} catch (error) {
			setTimeout(() => {
				fileService.removeFile(error.message) 				// if image upload failed
			}, 1000);
		}

	}

	res.status(200).json({
		status: 'success',
		data: updatedUser 	
	})
})



// PATCH /api/users/:id/follow-unfollow 		+ protect
exports.toggleFollow = catchAsync( async (req, res, next) => {
	const logedInUserId = req.userId
	const activeUserId = req.params.id

	const activeUser = await User.findById(activeUserId)
	if(!activeUser) return next(appError('activeUser not found'))

	const isFollowing  = activeUser.followers?.includes(logedInUserId)
	const operator = isFollowing ? '$pull' : '$addToSet'

	const updatedActiveUser = await User.findByIdAndUpdate( activeUserId, {
		[operator]: { followers: logedInUserId }
	}, { new: true })
	if(!updatedActiveUser) return next(appError('activeUser update followers is failed'))

	const updatedLogedInUser = await User.findByIdAndUpdate( logedInUserId, {
		[operator]: { followings: activeUserId }
	}, { new: true })
	if(!updatedLogedInUser) return next(appError('logedInUser update followings is failed'))


	res.status(200).json({
		status: 'success',
		data: updatedActiveUser 	
	})
})


// GET /api/users/:id/followers-followings 		+ protect
exports.getFollowFollowing = catchAsync(async (req, res, next) => {
	const userId = req.params.id

	const users = await User.findById(userId).select('followers followings')
	.populate({
		path: 'followers',
		select: 'avatar firstName lastName'
	})
	.populate({
		path: 'followings',
		select: 'avatar firstName lastName'
	})

	res.status(200).json({
		status: 'success',
		data: users
	})
})