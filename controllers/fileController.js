const fs = require('fs')
const path = require('path')
const { appError } = require('./errorController')

// GET /upload/*
exports.getUserFile = (req, res, next) => {
	try {
		const file = path.join(process.cwd(), req.originalUrl)

		if( !fs.existsSync(file) ) return next(appError('file not exists'))
		// res.sendFile( file )

		const readStream = fs.createReadStream(file)
		readStream.pipe(res)

	} catch (error) {
		next( appError(`Read uploaded file: ${error.message}`)	)
	}
}