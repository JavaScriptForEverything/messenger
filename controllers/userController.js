const User = require('../models/userModel')
const { apiFeatures } = require('../utils')
const { catchAsync } = require('./errorController')

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
