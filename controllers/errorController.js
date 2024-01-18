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

	res.status(err.statusCode || 404).json({
		message: err.message,
		status: err.status || 'failed',
		stack: err.stack
	})
}

// Route not setup
exports.pageNotFound = (req, res) => {
	const payload = { title: 'Not Found' }

	res.render('page/notFound', payload)
}

