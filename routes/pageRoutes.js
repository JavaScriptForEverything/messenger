const { Router } = require('express')
const pageController = require('../controllers/pageController')
const authController = require('../controllers/authController')

// => 	/
const router = Router()

router.get('/login', pageController.login)
router.get('/register', pageController.register)
router.get('/demo', pageController.demo)
router.get('/custom-audio-player', pageController.customAudioPlayer)
router.get('/', authController.protect, pageController.home)


module.exports = router