const { catchAsync, appError } = require('./errorController')
const { filterObjectByArray } = require('../utils')
const User = require('../models/userModel')
const fileService = require('../services/fileService')
const userDto = require('../dtos/userDto')

exports.register = async (req, res, next) => {
	try {
		const filteredBody = userDto.filterBody(req.body)

		if(filteredBody.avatar) {
			const { error, url } = await fileService.handleBase64File(filteredBody.avatar)
			if(error) return next(appError(error))
			filteredBody.avatar = url
			req.body.avatar = url 			// required to delete file if User.create() failed
		} else {
			// filteredBody.avatar = '/images/users/default.jpg'
			filteredBody.avatar = '/upload/users/default.jpg'
		}

		const user = await User.create( filteredBody )

		res.status(200).json({
			status: 'success',
			data: userDto.filterUser(user._doc) 	// mongoose ._doc is the documents to loop through user document
		})

	} catch (err) {
		fileService.removeFile(req.body.avatar)
		next(appError(err.message))		
	}
}