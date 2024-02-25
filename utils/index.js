// const path = require('path')
// const fs = require('fs');
// const { appError } = require('../controllers/errorController');

/*
	{{origin}}/api/reviews
		?_page=2
		&_limit=3
		&_sort=-createdAt,user
		&_search= review,review
		&_fields=review,user,createdAt

	const reviews = await apiFeatures(Review, req.query)
*/
exports.apiFeatures = (Model, query, newFilter={}) => {
	/* make sure use app.use( hpp() ), to prevent multiple params: 
				?_page=1&_page=3 				=> { _page: [1,3] } 			: without hpp() middleware
				?_page=1&_page=3 				=> { _page: 3 } 					: applied hpp() middleware
	*/ 

	const page = +query._page || 1
	const limit = +query._limit || 100
	const skip = page <= 0 ? 0 : (page - 1) * limit 

	const sort = query._sort?.toString().trim().split(',').join(' ') || 'createdAt'
	const select = query._fields?.toString().trim().split(',').join(' ') || '-_v'

	const search = query._search?.toString().trim().split(',') || ['', '']
	const [ searchValue, ...searchFields ] = search
	let searchObj = {
		"$or" : searchFields.map( field => ({ [field]: { "$regex": searchValue, "$options": "i" } }))
	}
	searchObj = search[1] ? searchObj : {}

	const filter = { ...searchObj, ...newFilter }

	return Model.find(filter) 					// => Searching
		.skip(skip).limit(limit) 					// => Pagination
		.sort( sort ) 										// => Sorting
		.select(select) 									// => Filtering

	/*
		const searchObj = { firstName: { $regex: 'name', $options: 'i'} } 		// single field
		const searchObj = { 																									// multi field
			$or: [
				{ firstName: { $regex: req.query.search, $options: 'i'} },
				{ lastName : { $regex: req.query.search, $options: 'i'} },
				{ username : { $regex: req.query.search, $options: 'i'} },
			]
		} 		
	*/
}


exports.filterObjectByArray = (body={}, allowedFields=[]) => {
	const tempObj = {}

	Object.entries(body).forEach(([key, value]) => {
		if(allowedFields.includes(key)) tempObj[key] = value
	})

	return tempObj
}



