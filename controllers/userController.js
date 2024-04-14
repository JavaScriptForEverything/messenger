const { isValidObjectId } = require('mongoose')
const { apiFeatures } = require('../utils')
const { catchAsync, appError } = require('./errorController')
const User = require('../models/userModel')
const userDto = require('../dtos/userDto')

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



// GET /api/users/:id
exports.getUserById = catchAsync( async (req, res, next) => {
	const userId = req.params.id
	if( !isValidObjectId(userId) ) return next(appError(`userId: ${userId} is invalid, please provide valid Id`))

	const user = await User.findById(userId)
	if(!user) return next(appError('user not found'))

	res.status(200).json({
		status: 'success',
		data: user 	
	})
})