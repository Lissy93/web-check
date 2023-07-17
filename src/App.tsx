import { Route, Routes } from 'react-router-dom';
import Home from 'pages/Home';
import Results from 'pages/Results';
import About from 'pages/About';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/results/:address" element={<Results />} />
      </Routes>
  );
}

export default App;
