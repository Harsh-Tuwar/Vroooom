const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');

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
	audio: false
}).then(stream => {
	videoStream = stream;
	addVideoStream(myVideo, stream);

	// on call recieve, answer it
	peer.on('call', call => {
		call.answer(stream);
		const video = document.createElement('video');
		call.on('stream', userVideoStream => {
			addVideoStream(video, userVideoStream);
		})
	})

	socket.on('user-connected', (userID) => {
		connectToNewUser(userID, stream);
	})
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