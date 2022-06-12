import { Route, Routes } from 'react-router-dom';
import Styled from 'styled-components';
import Home from 'pages/Home';
import colors from 'styles/colors';
import 'App.css';

const Container = Styled.main`
  background: ${colors.background};
  color: ${colors.textColor};
  width: 100vw;
  height: 100vh;
  margin: 0;
`;

function App() {
  return (
    <Container>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Container>
  );
}

export default App;
