const { Router } = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

// /api/users
const router = Router()

	router.route('/friends')
		.get(userController.getAllFriends)

	router.route('/filtered-users')
		.post( authController.protect, userController.getFilteredUsers)

	router.route('/')
		.get(userController.getAllUsers)

	router.route('/:id')
		.get(userController.getUserById)


module.exports = router