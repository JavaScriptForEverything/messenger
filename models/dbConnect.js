require('dotenv').config()
const { connect, connection } = require('mongoose')

const { NODE_ENV, DB_LOCAL_URL, DB_REMOTE_URL } = process.env || {}


const dbConnect = async () => {
	try {
		const DATABASE = NODE_ENV === 'production' ? DB_REMOTE_URL : DB_LOCAL_URL
		if(!DATABASE) return console.log(`DATABASE url empty`)

		if(connection.readyState >= 1) return
		const conn = await connect(DATABASE)	
		const { host, port, name } = conn.connection
		console.log(`---- Database connected to : [${host}:${port}/${name}]----` )

	} catch (err) {
		console.log(`database connection failed: ${err.message}`)
	}
}

module.exports = dbConnect