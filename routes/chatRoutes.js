const { Router } = require('express')
const chatController = require('../controllers/chatController')

// /api/chats/
const router = Router()

	router
		.get('/', chatController.getAllChats)
		.post('/', chatController.createChat)

	router
		.get('/:id', chatController.getChatById)

module.exports = router
