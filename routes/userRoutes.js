const { Router } = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

// /api/users
const router = Router()

	router.route('/friends')
		.get(authController.protect, userController.getAllFriends)


	router.route('/filtered-users')
		.post( authController.protect, userController.getFilteredUsers)

	router.route('/')
		.get(userController.getAllUsers)

	router.route('/:id')
		.get(userController.getUserById)

	router.route('/:id/follow-unfollow')
		.patch(authController.protect, userController.toggleFollow)

module.exports = router