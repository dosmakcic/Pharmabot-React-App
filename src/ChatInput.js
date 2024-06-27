import React, { useState } from 'react';
import styled from 'styled-components';

const InputContainer = styled.div`
  display: flex;
  padding: 10px;
  background-color: #ffffff;
  border-top: 1px solid #ccc;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 20px;
  background-color: #f0f0f0;
  margin-right: 10px;
`;
const ReloadButton=styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  background-color: #542e;
  margin-left: 10px;
  color: white;`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  background-color: #075e54;
  color: white;
  cursor: pointer;
`;

const ChatInput = ({ onSendMessage, onReload }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() !== '') {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <InputContainer>
      <Input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
      />
      <Button onClick={handleSend}>Send</Button>
      <ReloadButton onClick={onReload}>Reset</ReloadButton>
    </InputContainer>
  );
};

export default ChatInput;
