const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express(); //creating an express application (main server object) app is used to defing routes, serve static files nad handle requests
const server = http.createServer(app); //creates a raw http server and passes the express app into it
const io = socketIo(server); //attaching socketio to the server (hooking it) allow real time chat
//express app (routes, files) -> HTTP server (real server) -> Socket.IO (real time communication layer)

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/chat.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
}); //creating the database chat.db when the server runs

db.run(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

app.use(express.static(path.join(__dirname, 'public')));

//handling client connection
io.on('connection', (socket) => { //socket represents the one conencted user and this line is listening for a new client connection -> runs everytime a new user joins the chat
    console.log('A user connected: ' + socket.id);
    //loading all the messages from the db
    db.all(
        "SELECT username, message FROM messages ORDER BY id ASC",
        [],
        (err, rows) => {
            if (err){
                console.error(err);
                return;
            }
            //displaying the previous messages
            rows.forEach(row => {
                socket.emit("chat message", {
                    user: row.username,
                    msg: row.message
                });
            });
        }
    );
    //listening for a chat message
    socket.on('chat message', (data) =>{
        console.log('message: ' + data.msg + ' from user: ' + data.user);
        //show the message to all connected clients and inserting into the db
        db.run(
            "INSERT INTO messages (username, message) VALUES (?, ?)",
            [data.user, data.msg],
            (err) => {

                if (err) {
                    console.error(err.message);
                    return;
                }

                io.emit('chat message', data);
            }
        );
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