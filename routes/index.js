const { Router } = require('express')
const pageRouter = require('./pageRoutes')
const fileRouter = require('./fileRoutes')
const authRouter = require('./authRoutes')
const userRouter = require('./userRoutes')

const router = Router()

router.use('/', pageRouter)
router.use('/upload/*', fileRouter)
router.use('/api/auth', authRouter)
router.use('/api/users', userRouter)

module.exports = router