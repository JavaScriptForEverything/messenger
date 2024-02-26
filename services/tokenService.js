const jwt = require('jsonwebtoken')
// const Token = require('../models/tokenModel')

const { JWT_ACCESS_TOKEN_SECRET, JWT_REFRESH_TOKEN_SECRET } = process.env

/* Why we need 2 different type of token ?
		- 
*/

exports.generateTokens = async (payload) => {
	const accessToken = jwt.sign(payload, JWT_ACCESS_TOKEN_SECRET, { expiresIn: '1m' })
	const refreshToken = jwt.sign(payload, JWT_REFRESH_TOKEN_SECRET, { expiresIn: '1y' })

	return { accessToken, refreshToken }
}
