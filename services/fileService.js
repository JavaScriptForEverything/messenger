const crypto = require('crypto')
const path = require('path')
const fsPromises = require('fs/promises')
const fs = require('fs');
const { appError } = require('../controllers/errorController');



/*---------------[ upload file ]----------------
	const { error, url } = await handleBase64File(body.avatar, '/users', 'image')
	const { error, url } = await handleBase64File(body.avatar)
*/
module.exports.handleBase64File = async (dataUrl, subDir='/users', fileType='image') => {
	if(!dataUrl) return { error: 'dataUrl is empty' }
	const baseDir = '/upload'
	
	try {
		if( !dataUrl.startsWith('data') ) throw new Error('not valid dataUrl') 

		const [ metadata, base64 ] = dataUrl.split(';base64,')
		const mimetype = metadata.split(':').pop()
		const [ type, ext] = mimetype.split('/')

		if(type !== fileType) return { error: `file type: ${fileType} not valid file type` }

		const destination = path.join(process.cwd(), baseDir, subDir)
		await fsPromises.mkdir(destination, { recursive: true })

		const filename = crypto.randomUUID() + '.' + ext
		const filePath = path.join(destination, filename)

		// eslint-disable-next-line no-undef
		const buffer = Buffer.from(base64, 'base64')
		await fsPromises.writeFile(filePath, buffer)

		return {
			error: '',
			url: path.join(baseDir, subDir, filename)
		}

	} catch (err) {
		if(err) return appError(err.message)
	}
}

module.exports.removeFile = (relativePath) => {
	const filePath = path.join( process.cwd(), relativePath )

	if( !fs.existsSync(filePath) ) return console.log(`[removeFile] Error: ${filePath} not exist`)
	// fsPromises.unlink(filePath)

	fs.unlink(filePath, (err) => {
		if(err) return appError(err.message)
	})
}

