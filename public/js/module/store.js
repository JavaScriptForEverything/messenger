
/*
	To work store we must call after given value, if try to read before it returns null, 
	so suppose, we set store value in wss connection established, so we must access

	on events, which will fire later, to get access value. 
*/



const store = {
	logedInUser: null
}

export const setLogedInUser = (logedInUser) => {
	store.logedInUser = logedInUser
}

export const getState = () => {
	return store
}