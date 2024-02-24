const { Router } = require('express')
const pageController = require('../controllers/pageController')

// => 	/
const router = Router()

router.get('/login', pageController.login)
router.get('/', pageController.home)
router.get('/register', pageController.register)
router.get('/demo', pageController.demo)


module.exports = router