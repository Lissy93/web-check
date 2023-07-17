import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import Styled from 'styled-components';
import colors from 'styles/colors';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';


const Container = Styled.main`
  background: ${colors.background};
  color: ${colors.textColor};
  width: 100vw;
  height: 100%;
  min-height: 100vh;
  margin: 0;
`;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Container>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Container>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
