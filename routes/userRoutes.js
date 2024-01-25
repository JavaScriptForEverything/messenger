const { Router } = require('express')
const userController = require('../controllers/userController')

const router = Router()

	router.route('/')
		.get(userController.getAllUsers)

module.exports = router