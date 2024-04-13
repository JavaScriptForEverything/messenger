const { Router } = require('express')
const demoController = require('../controllers/demoController')

// /api/demos/
const router = Router()

	router
		.get('/', demoController.getAll)
		.post('/', demoController.create)

module.exports = router