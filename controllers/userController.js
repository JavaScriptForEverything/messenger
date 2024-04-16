const { isValidObjectId } = require('mongoose')
const { apiFeatures } = require('../utils')
const { catchAsync, appError } = require('./errorController')
const User = require('../models/userModel')
const userDto = require('../dtos/userDto')
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

	// friends = followers + followings
	const filter = { _id: { $ne: logedInUserId }}
	const users = await apiFeatures(User, req.query, filter).populate('latestMessage')

	// filter users fields and instead of populate user populate frields virtual property of followers + followings


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


// PATCH /api/users/:id/follow-unfollow + protect
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