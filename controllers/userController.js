const { isValidObjectId } = require('mongoose')
const User = require('../models/userModel')
const { apiFeatures } = require('../utils')
const { catchAsync, appError } = require('./errorController')

// GET /api/users
exports.getAllUsers = catchAsync( async (req, res, next) => {
	// const users = await User.find()
	const filter = {}
	const users = await apiFeatures(User, req.query, filter)

	res.status(200).json({
		status: 'success',
		count: users.length,
		data: users 	
	})
})


// GET /api/users/friends
exports.getAllFriends = catchAsync( async (req, res, next) => {

	// friends = followers + followings
	const filter = {}
	const users = await apiFeatures(User, req.query, filter)
	// filter users fields and instead of populate user populate frields virtual property of followers + followings

	res.status(200).json({
		status: 'success',
		count: users.length,
		data: users 	
	})
})




// POST /api/users/filtered-users
exports.getFilteredUsers = catchAsync( async (req, res, next) => {
	const { userIds = [] } = req.body

	const filter = { _id: { $in: userIds } }
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