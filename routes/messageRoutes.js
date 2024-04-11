const { Router } = require('express')
const messageContainer = require('../controllers/messageController')

// /api/messages
const router = Router()

	router.route('/')
		.get(messageContainer.getAllMessages)
		.post(messageContainer.createMessage)

	router.route('/chats')
		.get(messageContainer.getAllChatMessages)

module.exports = router