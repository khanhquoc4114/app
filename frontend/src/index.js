import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './components/AnimatedComponents.css';
import App from './App';
// Ant Design 5 không cần import CSS

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
); 