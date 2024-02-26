const store = {
	logedInUser: null
}

export const setLogedInUser = (logedInUser) => {
	store.logedInUser = logedInUser
}

export const getState = () => {
	return store
}