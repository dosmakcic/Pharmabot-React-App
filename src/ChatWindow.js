import React from 'react';
import styled from 'styled-components';

const ChatContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
`;

const Message = styled.div`
  margin: 10px;
  padding: 10px;
  border-radius: 10px;
  max-width: 60%;
  align-self: ${props => props.$sender === 'user' ? 'flex-end' : 'flex-start'};
  background-color: ${props => props.$sender === 'user' ? 'orange' : '#FFFFFF'};
`;

const ChatWindow = ({ messages }) => {
  return (
    <ChatContainer>
      {messages.map((msg, index) => (
        <Message key={index} $sender={msg.sender}>
          {msg.text}
        </Message>
      ))}
    </ChatContainer>
  );
};

export default ChatWindow;
