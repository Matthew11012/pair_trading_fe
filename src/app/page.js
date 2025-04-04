// src/App.jsx
"use client";
import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// import Dashboard from './components/Dashboard';
// import ModelCreator from './components/ModelCreator';
// import ModelViewer from './components/ModelViewer';
import Header from './components/Header';
// import Footer from './components/Footer';
import './globals.css';

export default function App() {
  const [isApiConnected, setIsApiConnected] = useState(false);
  
  // // Check API connection on component mount
  // useEffect(() => {
  //   async function checkApiConnection() {
  //     try {
  //       const response = await fetch('http://localhost:5000/api/test_connection');
  //       const data = await response.json();
  //       setIsApiConnected(data.status === 'success');
  //     } catch (error) {
  //       console.error('API connection error:', error);
  //       setIsApiConnected(false);
  //     }
  //   }
    
  //   checkApiConnection();
  // }, []);
  
  return (
    
    <div className="app">
      <Header isApiConnected={isApiConnected} />
      
      {/* <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<ModelCreator />} />
          <Route path="/model/:modelId" element={<ModelViewer />} />
        </Routes>
      </main>
      
      <Footer /> */}
    </div>
    
  );
}
