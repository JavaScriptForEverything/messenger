## messanger-app Node.js Socket.io WebRTC MongoDB

![home-page]()


![home-page.png](https://github.com/JavaScriptForEverything/messenger/blob/master/public/images/project_design/page/web/home-page.png)


## Backend
- file upload
	- upload file as base64 dataUrl 
	- resize image via `jimp` package
	- send image as `stream` instead of whole file at once.

- API Features
	- 
	- pagination
	- searching 	[ based on multiple fields ]
	- sorting,
	- filter: only given fields fetched from database,



## Frontend
- Search
	- 
	- Shows searched users into a modal bellow in `input:search`
	- show selected (clicked) search user in message area like friendList selected friend
	- cancel previous request before create new request, 
		- to save network request + bandwidth
		- fetch only current requested users, instead of all searched 


- Send message
	- 
	- send text message + emoji text 
	- send image as message + optimize image in backend
	- Allow to capture audio via microphone
		- show audio recording in UI, 
		- Send audio to backend as message and shows those messages in UI
		- Show audio in `Wavefrom` format instead of simple audio 
		- Show latest message in friendList message : text | image | audio 