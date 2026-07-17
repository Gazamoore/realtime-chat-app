import { useEffect, useState, useRef } from 'react';
import { socket } from './socket';
 
function Chat() {
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState('');
  const [msg, setMsg] = useState('');
  const bottomRef = useRef(null);
 
  useEffect(() => {
    const handler = (data) => setMessages((prev) => [...prev, data]);
    socket.on('chat message', handler);
    return () => socket.off('chat message', handler);
  }, []);
 
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
 
  const sendMessage = (e) => {
    e.preventDefault();
    if (user.trim() && msg.trim()) {
      socket.emit('chat message', { user: user.trim(), msg: msg.trim() });
      setMsg('');
    }
  };
 
  return (
    <div className="chat">
      <ul className="messages">
        {messages.length === 0 && (
          <li className="messages-empty">No messages yet.</li>
        )}
        {messages.map((m, i) => {
          const isOwn = user.trim() !== '' && m.user === user.trim();
          return (
            <li key={i} className={`message${isOwn ? ' message-own' : ''}`}>
              {!isOwn && <span className="message-user">{m.user}</span>}
              <span className="message-bubble">{m.msg}</span>
            </li>
          );
        })}
        <div ref={bottomRef} />
      </ul>
 
      <form className="composer" onSubmit={sendMessage}>
        <input
          className="name-input"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="Your name"
          autoComplete="off"
        />
        <input
          className="message-input"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Type a message"
          autoComplete="off"
          maxLength={2000}
        />
        <button type="submit" className="send-btn">Send</button>
      </form>
    </div>
  );
}
 
export default Chat;