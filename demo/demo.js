const calculateAudioCurrentTimeValue = (currentTime) => {
	const currentHour = parseInt( currentTime / (60*60) ) % 24
	const currentMinute = parseInt( currentTime / 60 ) % 60
	const currentSecondsLong = currentTime % 60
	const currentSeconds = currentSecondsLong.toFixed()

	currentTime = (currentMinute < 10 ?  "0" + currentMinute : currentMinute) + " :" +  (currentSeconds < 10 ? "0" + currentSeconds : currentSeconds)

	return currentTime
}

const calculateAudioTotalTimeValue = (length) => {
	
	const minutes = Math.floor( length / 60)
	const secondsInt = length - (minutes * 60)
	const secondsStr = secondsInt.toString()
	const seconds = secondsStr.substr(0, 2)
	const time = minutes + ':' + seconds

	return time
}

// | 			function calculateAudioTotalTimeValue(length) { 																						|
// | 			  var minutes = Math.floor(length / 60), 																										|
// | 			    seconds_int = length - minutes * 60, 																										|
// | 			    seconds_str = seconds_int.toString(), 																									|
// | 			    seconds = seconds_str.substr(0, 2), 																										|
// | 			    time = minutes + ':' + seconds 																													|
// | 			 																																														|
// | 			  return time; 																																							|
// | 			} 																																													|

