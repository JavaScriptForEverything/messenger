const User = require('../models/userModel')
const { catchAsync } = require('./errorController')

exports.getAllUsers = catchAsync( async (req, res, next) => {
	const users = await User.find()

	res.status(200).json({
		status: 'success',
		count: users.length,
		data: users 	
	})
})
