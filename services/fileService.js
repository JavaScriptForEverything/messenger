const crypto = require('node:crypto')
const path = require('node:path')
const fsPromises = require('node:fs/promises')
const fs = require('node:fs');
const { Buffer } = require('node:buffer')
const { appError } = require('../controllers/errorController');
const Jimp = require('jimp')



/*---------------[ upload file ]----------------
	const { error, url } = await handleBase64File(body.avatar, '/users', 'image')
	const { error, url } = await handleBase64File(body.avatar)
*/
module.exports.handleBase64File = async (dataUrl, subDir='/users', fileType='image') => {
	if(!dataUrl) return { error: 'dataUrl is empty' }
	const baseDir = '/upload'
	
	try {
		if( !dataUrl.startsWith('data') ) throw new Error('not valid dataUrl') 

		// Step-1: seperate metadata from base64 string dataUrl 
		const [ metadata, base64 ] = dataUrl.split(';base64,')
		const mimetype = metadata.split(':').pop()
		const [ type, ext] = mimetype.split('/')

		// // Step-2: allow file: image(default), pdf, ...
		// if(type !== fileType) return { error: `file type: ${fileType} not valid file type` }

		const destination = path.join(process.cwd(), baseDir, subDir)
		await fsPromises.mkdir(destination, { recursive: true })

		// Step-3: Generate unique filename for file
		const filename = crypto.randomUUID() + '.' + ext
		// const filename = crypto.randomUUID() + '.png' 					// Jimp only support: jpej|png|gim|bmp|tiff
		const filePath = path.join(destination, filename)
		const buffer = Buffer.from(base64, 'base64')

		// Step-4: Resize image before save
		if(fileType === 'image') {
			const image = await Jimp.read(buffer)
			image.resize(150, 150).quality(80).write(filePath)

		} else {
			await fsPromises.writeFile(filePath, buffer) 				// Without resize
		}

		return {
			error: '',
			url: path.join(baseDir, subDir, filename)
		}

	} catch (err) {
		if(err) return appError(err.message)
	}
}

module.exports.removeFile = (relativePath) => {
	if(typeof relativePath !== 'string') return appError(`file path must be string, but got '${relativePath}'`)

	const filePath = path.join( process.cwd(), relativePath )

	if( !fs.existsSync(filePath) ) return console.log(`[removeFile] Error: ${filePath} not exist`)
	// fsPromises.unlink(filePath)

	fs.unlink(filePath, (err) => {
		if(err) return appError(err.message)
	})
}

