const User = require('../models/userModel')
const { apiFeatures } = require('../utils')
const { catchAsync } = require('./errorController')

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

// POST /api/users/filtered-users
exports.getFilteredUsers = catchAsync( async (req, res, next) => {
	const userIds = req.body.users

	const filter = { _id: { $in: userIds } }
	const users = await apiFeatures(User, req.query, filter)

	res.status(200).json({
		status: 'success',
		count: users.length,
		data: users 	
	})
})
