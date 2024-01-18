const { createServer } = require('http')
const { Server } = require('socket.io')
const app = require('./app')
const socketController = require('./controllers/socketController')

const httpServer = createServer(app)
const io = new Server(httpServer)


io.on('connect', socketController(io))

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, async () => console.log(`server on: http://localhost:${PORT}`))
