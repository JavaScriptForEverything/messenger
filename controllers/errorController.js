exports.catchAsync = (fn) => {
	return (req, res, next) => {
		return fn(req, res, next).catch(next)
	}
}

exports.appError = (message='', statusCode=400, status='error') => {
	const error = new Error(message) 	
	error.statusCode = statusCode
	error.status = status

	return error
}


// Express Global Error handler
exports.errorHandler = (err, req, res, next) => {
	const { NODE_ENV = 'development' } = process.env

	res.status(err.statusCode || 404).json({
		message: err.message,
		status: err.status || 'failed',
		stack: NODE_ENV === 'development' ? err.stack : undefined
	})
}

exports.apiRouteNotFound = (req, res, next) => {
	const payload = { title: 'Not Found' }

	next(this.appError(`route ${req.originalUrl} not found`, 404, 'NotFound'))
	// res.render('page/notFound', payload)
}

exports.pageNotFound = (req, res) => {
	const payload = { title: 'Not Found' }

	res.render('page/notFound', payload)
}

