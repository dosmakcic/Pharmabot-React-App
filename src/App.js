import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: #075e54;
`;

const questions = [
  'Koji je vaš problem?',
  'Koliko imate godina?',
  'Jeste li alergični na nešto?',
  'Jeste li trudnica?'
];

const App = () => {
  const [messages, setMessages] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
   
    setMessages([{ sender: 'bot', text: questions[currentQuestionIndex] }]);
  }, []);

  const handleSendMessage = async (message) => {
    const userMessage = { sender: 'user', text: message };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const updatedResponses = [...responses, message];
    setResponses(updatedResponses);

    const nextQuestionIndex = currentQuestionIndex + 1;

    if (nextQuestionIndex < questions.length) {
      const botMessage = { sender: 'bot', text: questions[nextQuestionIndex] };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      
      if (updatedResponses.length === 4) {

        console.log(updatedResponses);

        try {
          const response = await fetch('http://127.0.0.1:5000/process', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json; charset=UTF-8'
            },
            
            body: JSON.stringify({ responses: updatedResponses })
          });

          

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          console.log('Server response:', data);

          if (data.appropriate_medicines) {
            const botMessage = { sender: 'bot', text: 'Hvala na informacijama! Evo savjeta: ' + data.appropriate_medicines };
            setMessages((prevMessages) => [...prevMessages, botMessage]);
          } else {
            const botMessage = { sender: 'bot', text: 'S obzirom na vaše odgovore nisam u mogoućnosti ispisati vam lijek. Savjetujem da se posavjetujete s liječnikom. ' };
            setMessages((prevMessages) => [...prevMessages, botMessage]);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      } else {
        console.error('Expected 4 responses, but got', updatedResponses.length);
      }
    }
  };

  const handleReload = () =>{
    setMessages([{sender: 'bot', text: questions[0] }]);
    setCurrentQuestionIndex(0);
    setResponses([]);
  };

  return (
    <AppContainer>
      <ChatWindow messages={messages} />
      <ChatInput onSendMessage={handleSendMessage} onReload={handleReload} />
    </AppContainer>
  );
};

export default App;
