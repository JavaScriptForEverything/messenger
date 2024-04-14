const { catchAsync, appError } = require('./errorController')
const User = require('../models/userModel')
const fileService = require('../services/fileService')
const tokenService = require('../services/tokenService')
const userDto = require('../dtos/userDto')
const slug = require('slug')


exports.protect = async (req, res, next) => {
	try {
		const { accessToken } = req.cookies

		const { error, payload } = await tokenService.verifyAccessToken( accessToken )

		if( error && req.originalUrl.startsWith('/api') ) return next(appError(error, 401, 'AuthError'))
		if( error ) return res.redirect('/login')

		req.userId = payload._id
		// console.log({ error, payload })

		next()

	} catch (error) {
		// if( error ) return res.redirect('/login')
		console.log(error)
	}
}

// POST /api/auth/register
exports.register = async (req, res, next) => {
	try {
		const filteredBody = userDto.filterBody(req.body)
		const { username, firstName, lastName, email } = filteredBody

		if(username) {
			const isUsernameExists = await User.findOne({ username })
			if(isUsernameExists) return next(appError('this username already taken by someone'))

		} else {
			filteredBody.username = slug(`${firstName} ${lastName} ${email}`, '-')
		}

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
		// jimp (image cropper) take some time to crop, so delay a for 1s
		setTimeout(() => {
			fileService.removeFile(req.body.avatar)
		}, 1000)

		next(appError(err.message))		
	}
}

// POST /api/auth/login
exports.login =  catchAsync(async(req, res, next) => {
	const { email, password } = req.body
	
	// Step-1: find user
	const user = await User.findOne({ email }).select('+password')
	if(!user) return next(appError('email is not found. please register first'))

	const userId = user._id

	// Step-2: check password
	const isPasswordVerified = await user.comparePassword( password, user.password )
	if(!isPasswordVerified) return next(appError('your email or password is wrong', 401))

	// Step-3: Generate tokens and send as cookie
	const payload = { _id: userId }
	const { accessToken, refreshToken } = await tokenService.generateTokens(payload)


	// step-4: store token into database
	const token = await tokenService.findRefreshToken(userId)
	if(token) {
		// if already exists then update exists one
		tokenService.updateRefreshToken(refreshToken, userId)
	} else {
		// if not exists then create one
		const storedRefreshToken = await tokenService.storeRefreshToken(refreshToken, userId)
		if(!storedRefreshToken) return next(appError('string refreshToken failed', 401, 'TokenError'))
	}


	// step-5: Store both token into cookie which is HTTPS only : To prevent any XSS attach
	res.cookie('accessToken', accessToken, {
		maxAge: 1000 * 60 * 60 * 24 * 7, 					// 7 days : or 2-20 minute for security purpose
		httpOnly: true,
		sameSite: 'strict'
	})
	res.cookie('refreshToken', refreshToken, {
		maxAge: 1000 * 60 * 60 * 24 * 365, 				// 1 year
		httpOnly: true,
		sameSite: 'strict'
	})


	res.status(200).json({
		status: 'success',
		data: userDto.filterUser(user._doc) 	
	})
})



// Get 	/api/auth/logout + protect
exports.logout = catchAsync(async (req, res, next) => {
	const userId = req.userId
	if(!userId) return next(appError('only logedIn user can logout'))

	// Step-1: delete user's refreshToken by userId
	const tokenDoc = await tokenService.deleteRefreshToken(userId)
	if(!tokenDoc) return next(appError('delete refreshToken failed'))

	// Step-2: remove cookies: accessToken, refreshToken
	res.clearCookie('accessToken')
	res.clearCookie('refreshToken')

	res.status(201).json({
		status: 'success', 
		data: {
			logout: 'success'
		}
	})
})

