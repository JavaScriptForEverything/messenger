const { Router } = require('express')
const notification = require('../controllers/notificationController')

// /api/notifications/
const router = Router()

	router
		.get('/', notification.getAllNotifications)
		// .post('/', notification.createChat) 	// created by .post('/', createMessage)

	router
		.get('/:id', notification.getNotificationById)

module.exports = router

