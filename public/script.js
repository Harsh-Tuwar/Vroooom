const socket = io('/');
const videoGrid = $('#video-grid');
const myVideo = document.createElement('video');
const msgInput = $('input');
// input value
let text = $("input");

let videoStream;

myVideo.muted = true;

// new Peer connection
const peer = new Peer(undefined, {
	path: '/peerjs',
	host: '/',
	port: '3030'
});

navigator.mediaDevices.getUserMedia({
	video: true,
	audio: true
}).then(stream => {
	videoStream = stream;
	
	addVideoStream(myVideo, stream);
	
	peer.on('call', call => {
		call.answer(stream);
		const video = document.createElement('video');
		call.on('stream', userVideoStream => {
			addVideoStream(video, userVideoStream);
		});
	});

	socket.on('user-connected', userID => {
		connectToNewUser(userID, stream);
	});

	// when press enter send message
	$('html').keydown(function (e) {
		if (e.which == 13 && text.val().length !== 0) {
			socket.emit('sendMessage', text.val(), ROOM_ID);
			text.val('');
		}
	});

	socket.on("appendMsg", (message) => {
		$('#messages_container').append(`<li class="message"><b>User</b><br />${message}</li>`)
	});
});

peer.on('open', id => {
	socket.emit('join-room', ROOM_ID, id);
})

socket.emit('join-room', ROOM_ID);

// call new user :P
const connectToNewUser = (userID, stream) => {
	const call = peer.call(userID, stream);
	const video = document.createElement("video");

	call.on("stream", userVideoStream => {
		addVideoStream(video, userVideoStream);
	});
}

const addVideoStream = (video, stream) => {
	video.srcObject = stream;

	//play video
	video.addEventListener('loadedmetadata', () => {
		video.play()
	})

	videoGrid.append(video);
}


// helper functionssssss 
const scrollToBottom = () => {
	const container = $('.main__chat_window');
	container.scrollTop(container.prop('scrollHeight'));
}


// mute state
const changeMuteState = () => {
	const state = videoStream.getAudioTracks()[0]?.enabled;

	videoStream.getAudioTracks()[0].enabled = !state;
	
	(state) ? setUnMuteState() : setMuteState();
}

const setMuteState = () => {
	const html = `
		<i class="fas fa-microphone"></i>
		<span>Mute</span>
	`;

	$('.main__mute_button').html(html);
}

const setUnMuteState = () => {
	const html = `
		<i class="unmute fas fa-microphone-slash"></i>
		<span> Unmute </span>
	`;
	
	$('.main__mute_button').html(html);
}


// video state
const changeVideoState = () => {
	const currentState = videoStream.getVideoTracks()[0]?.enabled;
	
	videoStream.getVideoTracks()[0].enabled = !currentState;

	(currentState) ? showVideo() : hideVideo();
}

const showVideo = () => {
	const html = `
		<i class="stop fas fa-video-slash"></i>
		<span>Play Video</span>
	`;

	$('.main__video_button').html(html);
}

const hideVideo = () => {
	const html = `
		<i class="fas fa-video"></i>
		<span>Stop Video</span>
	`;

	$('.main__video_button').html(html);
}
