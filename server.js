const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express(); //creating an express application (main server object) app is used to defing routes, serve static files nad handle requests
const server = http.createServer(app); //creates a raw http server and passes the express app into it
const io = socketIo(server); //attaching socketio to the server (hooking it) allow real time chat
//express app (routes, files) -> HTTP server (real server) -> Socket.IO (real time communication layer)

app.use(express.static(path.join(__dirname, 'public')));

//handling client connection
io.on('connection', (socket) => { //socket represents the one conencted user and this line is listening for a new client connection -> runs everytime a new user joins the chat
    console.log('A user connected: ' + socket.id);

    //listening for a chat message
    socket.on('chat message', (data) =>{
        console.log('message: ' + data.msg + ' from user: ' + data.user);
        //show the message to all connected clients
        io.emit('chat message', data);
    });

    //listening for when a client disconnects
    socket.on('disconnect', () => {
        console.log('User disconnect: ' + socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Chat server running on port ${PORT}`);
});