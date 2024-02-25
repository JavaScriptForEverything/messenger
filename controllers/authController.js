const { catchAsync, appError } = require('./errorController')
const { filterObjectByArray } = require('../utils')
const User = require('../models/userModel')
const fileService = require('../services/fileService')
const userDto = require('../dtos/userDto')

exports.register = catchAsync( async (req, res, next) => {

	const filteredBody = userDto.filterBody(req.body)

	const { error, url } = await fileService.handleBase64File(filteredBody.avatar)
	if(error) return next(appError(error))

	filteredBody.avatar = url

	const user = await User.create( filteredBody )

	res.status(200).json({
		status: 'success',
		data: userDto.filterUser(user._doc)
	})
})