const { Router } = require('express')
const pageController = require('../controllers/pageController')

// => 	/
const router = Router()

router.get('/', pageController.home)
router.get('/demo', pageController.demo)


module.exports = router