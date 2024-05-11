const { Router } = require('express')
const messageContainer = require('../controllers/messageController')

// /api/messages
const router = Router()

	router.route('/chats')
		.get(messageContainer.getAllChatMessages)

	router.route('/:id')
		.delete(messageContainer.deleteMessageById)

	router.route('/')
		.get(messageContainer.getAllMessages)
		.post(messageContainer.createMessage) 


module.exports = router