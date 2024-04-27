## messanger-app Node.js Socket.io WebRTC MongoDB Tailwindcss pug

![webRTC-banner.png](https://github.com/JavaScriptForEverything/messenger/blob/master/public/images/webRTC-banner.png)



#### Project Design 	[/public/images/project_design](https://github.com/JavaScriptForEverything/messenger/tree/master/public/images/project_design)


| Web View            	| Mobile View            |
| ---------------------- | ---------------------- |
| ![web-view](https://github.com/JavaScriptForEverything/messenger/blob/master/public/images/project_design/page/web/home-page.png) | ![mobile-view](https://github.com/JavaScriptForEverything/messenger/blob/master/public/images/project_design/page/mobile/home-page-with-left-panel.png) | 



| Caller Side            | Callee Side            |
| ---------------------- | ---------------------- |



## Backend
- file upload
	- upload file as base64 dataUrl 
	- resize image via `jimp` package
	- crop image via `cropperjs` package
	- send image as `stream` instead of whole file at once.

- API Features
	- 
	- pagination
	- searching 	[ based on multiple fields ]
	- sorting,
	- filter: only given fields fetched from database,

- Stream
	- send every file (image | audio, video, file) as `stream` so that no matter how large the file is, don't crush the server.





## Frontend
- Search
	- 
	- Shows searched users into a modal bellow in `input:search`
	- show selected (clicked) search user in message area like friendList selected friend
	- cancel previous request before create new request, 
		- to save network request + bandwidth
		- fetch only current requested users, instead of all searched 

- Upload Image:
	- all drag and drop and browse multiple images
	- show previes of selected images as carousel
	- crop selected images in carousel and return updated image lists
	- imageUploadDialog is fully flexible file uploader, which perform above task dynamically, if add file instead of image, then preview and image-croping will be disabled. 


- Instant message via `Socket.io`
	- 
	- send text message + emoji text 
	- send image as message + optimize image in backend
	- Allow to capture audio via microphone
		- show audio recording in UI, 
		- Send audio to backend as message and shows those messages in UI
		- Show audio in `Wavefrom` format instead of simple audio 
		- Show latest message in friendList message : text | image | audio 
		- Handle `Dran & Drop` file upload: handle via `WebRTC`: Peer-to-Peer file sharing


- Calling Features via `WebRTC`
	- 
	- Audio Call | Video Call
	- Show incomming-call dialog
	- Show outgoing-call dialog
	- Show user not-found call dialog
	- Show callee-busy call dialog
	- accept call button
	- reject call button



#### Routes
```
GET 	/ 												: 
GET 	/login 										: 
GET 	/register 								: 
GET 	/profile 									:
GET 	/profile/:id 							:

GET 	/demo 	 									: Testing page
GET 	/custom-audio-player 	 		: Custom Audio player 
GET 	/drag-and-drop 	 					: To handle drag and drop file upload
```

