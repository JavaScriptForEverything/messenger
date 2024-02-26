## messanger-app Node.js Socket.io WebRTC MongoDB

![home-page]()


![home-page.png](https://github.com/JavaScriptForEverything/messenger/blob/master/public/images/project_design/page/web/home-page.png)


Backend
- file upload
	- upload file as base64 dataUrl 
	- resize image via `jimp` package
	- send image as `stream` instead of whole file at once.

- API Features
	- pagination
	- searching,
	- sorting,
	- filter: only given fields fetched from database,