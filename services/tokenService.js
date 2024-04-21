const jwt = require('jsonwebtoken')
const Token = require('../models/tokenModel')

const { JWT_ACCESS_TOKEN_SECRET, JWT_REFRESH_TOKEN_SECRET } = process.env

/* Why we need 2 different type of token ?
		- 
*/

// const { accessToken, refreshToken } = await generateTokens({ _id: user._id })
exports.generateTokens = async (payload) => {
	const accessToken = jwt.sign(payload, JWT_ACCESS_TOKEN_SECRET, { expiresIn: '7d' })
	const refreshToken = jwt.sign(payload, JWT_REFRESH_TOKEN_SECRET, { expiresIn: '1y' })

	return { accessToken, refreshToken }
}

// const { error, payload } = await tokenService.verifyAccessToken( accessToken )
exports.verifyAccessToken = async (accessToken) => {
	const tempObj = {}
	try {
		tempObj.payload = jwt.verify(accessToken, JWT_ACCESS_TOKEN_SECRET)
	} catch (error) {
		// if validation failed then if set statusCode 401, then axios.interceptors will fires
		tempObj.error = error.message
	}
	return tempObj 
}
exports.verifyRefreshToken = async (refreshToken) => {
	const tempObj = {}
	try {
		tempObj.payload = jwt.verify(refreshToken, JWT_REFRESH_TOKEN_SECRET)
	} catch (error) {
		tempObj.error = error.message
	}
	return tempObj
}


// Create
exports.storeRefreshToken = async (refreshToken, userId) => {
	return await Token.create({ refreshToken, user: userId })
}

// Read
exports.findRefreshToken = async (userId) => {
	return Token.findOne({ user: userId })
}

// Update
exports.updateRefreshToken = async (refreshToken, userId) => {
	return Token.findOneAndUpdate({ user: userId }, { refreshToken })
}

// Delete
exports.deleteRefreshToken = async (userId) => {
	return Token.deleteOne({ user: userId })
}