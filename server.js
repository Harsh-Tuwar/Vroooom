const express = require('express');
const uuid = require('uuid');
const colors = require('colors');

const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
	debug: true
});

const PORT = process.env.PORT || 3030;

// set up engine
app.set('view engine', 'ejs');
// setup public
app.use(express.static('public'));

// what URL peer is going to use??
app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
	res.redirect(`/${uuid.v4()}`)
});

app.get('/:room', (req, res) => {
	res.render('room', { roomID: req.params.room });
});

io.on('connection', socket => {
	socket.on('join-room', (roomID, userID) => {
		socket.join(roomID);
		socket.to(roomID).broadcast.emit('user-connected', userID);
	});

	// messages
	socket.on('sendMessage', (message, roomID) => {
		//send message to the same room
		io.to(roomID).emit('appendMsg', message);
	});
})

		
server.listen(PORT, console.log(`Server is running on http//localhost:${PORT}`.blue.bold));