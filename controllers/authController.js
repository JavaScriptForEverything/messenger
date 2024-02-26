const { catchAsync, appError } = require('./errorController')
const { filterObjectByArray } = require('../utils')
const User = require('../models/userModel')
const fileService = require('../services/fileService')
const tokenService = require('../services/tokenService')
const userDto = require('../dtos/userDto')

// /api/auth/register
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

// /api/auth/login
exports.login =  catchAsync(async(req, res, next) => {
	const { email, password } = req.body
	
	// Step-1: find user
	const user = await User.findOne({ email }).select('+password')
	if(!user) return next(appError('email is not found. please register first'))

	// Step-2: check password
	const isPasswordVerified = await user.comparePassword( password, user.password )
	if(!isPasswordVerified) return next(appError('your email or password is wrong', 401))

	// Step-3: Generate tokens and send as cookie
	const payload = { _id: user._id }
	const { accessToken, refreshToken } = await tokenService.generateTokens(payload)

	// step-4: Store both token into cookie which is HTTPS only : To prevent any XSS attach
	res.cookie('accessToken', accessToken, {
		maxAge: 1000 * 60 * 60 * 24 * 7, 					// 7 days : or 2-20 minute for security purpose
		httpOnly: true
	})
	res.cookie('refreshToken', refreshToken, {
		maxAge: 1000 * 60 * 60 * 24 * 365, 				// 1 year
		httpOnly: true
	})


	res.status(200).json({
		status: 'success',
		data: userDto.filterUser(user._doc) 	
	})
})