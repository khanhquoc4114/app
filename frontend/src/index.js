import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './components/AnimatedComponents.css';
import AppMain from './App';
import { NotificationProvider } from "./contexts/NotificationContext";
import { App } from "antd";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <NotificationProvider>
      <App>
        <AppMain />
      </App>
    </NotificationProvider>
  </React.StrictMode>
); 

export default root;