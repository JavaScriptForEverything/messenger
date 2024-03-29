const { Router } = require('express')
const userController = require('../controllers/userController')

const router = Router()

	router.route('/')
		.get(userController.getAllUsers)

	router.route('/filtered-users')
		.post(userController.getFilteredUsers)

module.exports = router