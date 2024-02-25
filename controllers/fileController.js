const fs = require('fs')
const path = require('path')
const { appError } = require('./errorController')

// GET /upload/*
exports.getUserFile = (req, res, next) => {
	try {
		const file = path.join(process.cwd(), req.originalUrl)

		if( !fs.existsSync(file) ) return next(appError('file not exists'))
		res.sendFile( file )

	} catch (error) {
		appError(`Read uploaded file: ${error.message}`)		
	}
}