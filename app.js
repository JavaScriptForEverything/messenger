const path = require('path')
const livereload = require('livereload') 									// for reload browser
const connectLivereload = require('connect-livereload') 	// for reload browser
const express = require('express')

const errorController = require('./controllers/errorController')
const pageRouter = require('./routes/pageRoute')

const publicDirectory = path.join(process.cwd(), 'public')
const app = express()

app.set('view engine', 'pug')
app.use(express.static( publicDirectory ))

// -----[ For LiveReload ]-----
// Used for development purpose: To reload browser on file changes
if(process.env.NODE_ENV === 'development') {
	const livereloadServer = livereload.createServer() 				// for reload browser
	livereloadServer.watch(publicDirectory)
	livereloadServer.server.once('connection', () => {
		setTimeout(() => livereloadServer.refresh('/') , 10);
	})

	app.use(connectLivereload()) 													// for reload browser
}


app.use(pageRouter)

app.use(errorController.errorHandler)
app.all('*', errorController.pageNotFound)

module.exports = app