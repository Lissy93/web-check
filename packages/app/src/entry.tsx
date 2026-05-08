import { createRoot } from 'react-dom/client';
import Main from './main';
import './styles/index.css';

// Standalone mount used by vite build and the Express server
const container = document.getElementById('root');
if (container) createRoot(container).render(<Main />);
