const socket = io(); //Connecting to the server
const form = document.getElementById('form');
const messageInput = document.getElementById('messageInput');
const userInput = document.getElementById('userInput');
const messages = document.getElementById('messages');

form.addEventListener('submit', (e) =>{
    e.preventDefault();
    if(userInput.value && messageInput.value){
        socket.emit('chat message', {
            user: userInput.value,
            msg: messageInput.value
        });
        messageInput.value = '';
    }
    return false;
});

//Listening for the message event from the server
socket.on('chat message', (data) => {
    const item = document.createElement('li');
    item.textContent = `${data.user}: ${data.msg}`;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});