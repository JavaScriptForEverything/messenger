const { isValidObjectId } = require('mongoose')
const { apiFeatures } = require('../utils')
const { catchAsync, appError } = require('./errorController')
const Notification = require('../models/notificationModel')

// GET /api/notifications
exports.getAllNotifications = catchAsync( async (req, res, next) => {
	const filter = {}
	const notification = await apiFeatures(Notification, req.query, filter)

	res.status(200).json({
		status: 'success',
		count: notification.length,
		data: notification
	})
})


// GET /api/notifications/:id 		
exports.getNotificationById = catchAsync( async (req, res, next) => {
	const notificationId = req.params.id
	if( !isValidObjectId(notificationId) ) return next( appError('invalid notification.id '))

	const notification = await Notification.findById(notificationId)
	if(!notification) return next(appError('user not found'))

	res.status(200).json({
		status: 'success',
		data: notification 	
	})
})
