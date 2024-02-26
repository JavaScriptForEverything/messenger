const crypto = require('crypto')
const path = require('path')
const livereload = require('livereload') 									// for reload browser
const connectLivereload = require('connect-livereload') 	// for reload browser
const express = require('express')
const cookieParser = require('cookie-parser')

const errorController = require('./controllers/errorController')
const routers = require('./routes')

const publicDirectory = path.join(process.cwd(), 'public')
const app = express()

app.set('view engine', 'pug')
app.use(express.static( publicDirectory ))
app.use(express.json({ limit: '5mb' }))
app.use(cookieParser())

app.use((req, res, next) => {
	res.locals.cspNonce = crypto.randomBytes(16).toString('hex')
	next()
})


// -----[ For LiveReload ]-----
// Used for development purpose: To reload browser on file changes
if(process.env.NODE_ENV === 'development') {
	const livereloadServer = livereload.createServer() 				// for reload browser
	livereloadServer.watch(publicDirectory)
	livereloadServer.server.once('connection', () => {
		setTimeout(() => livereloadServer.refresh('/') , 100);
	})

	app.use(connectLivereload()) 													// for reload browser
}


// handle all routes:
app.use('/', routers)


app.use(errorController.errorHandler)
app.all('*', errorController.pageNotFound)

module.exports = app