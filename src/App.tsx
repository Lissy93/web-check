import React from 'react';
import Styled from 'styled-components';
import Demo from 'components/Demo';
import 'App.css';

const Container = Styled.div`
  background: #bfc;
  width: fit-content;
  margin: 1rem auto;
  padding: 0.5rem 1rem;
  border-radius: 6px;
`;

function App() {
  return (
    <Container className="App">
      <h1>Hello 👋</h1>
      <Demo message="React is Dumb," />
    </Container>
  );
}

export default App;
