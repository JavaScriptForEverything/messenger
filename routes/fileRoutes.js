const { Router } = require('express')
const fileController = require('../controllers/fileController')

// => /upload/*
const router = Router()

router.get('/*', fileController.getUserFile)

module.exports = router