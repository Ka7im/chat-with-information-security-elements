import React from 'react';
import './message.css'

const Message = ({login, text}) => {
  return (
    <div className="message-wrapper">
      <div className="login">{login}</div>
      <div className="message">{text}</div>
    </div>
  );
};

export default Message;