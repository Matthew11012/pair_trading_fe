"use client";
import Link from "next/link";
import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // In a real application, you would fetch the list of models from the API
  // For this demo, we'll simulate with localStorage
  // useEffect(() => {
  //   setIsLoading(true);
  //   try {
  //     const savedModels = JSON.parse(localStorage.getItem('pairTradingModels')) || [];
  //     setModels(savedModels);
  //     console.log(models)
  //   } catch (error) {
  //     console.error('Error loading models:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, []);

  useEffect(() => {
    setIsLoading(true);
    async function fetchModels() {
      try {
        const response = await fetch('http://localhost:5000/api/get_all_models');
        const result = await response.json();
        
        if (result.status === 'success') {
          setModels(result.models);
        } else {
          console.error('Failed to fetch models:', result.message);
        }
      } catch (error) {
        console.error('Error loading models:', error);
      } finally {
        setIsLoading(false);
      }
    }
  
    fetchModels();
  }, []);
  
  
  const deleteModel = async (modelId) => {
    if (window.confirm('Are you sure you want to delete this model?')) {
      try {
        // API call to delete the model
        const response = await fetch(`http://localhost:5000/api/delete_model/${modelId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          // Update localStorage
          const updatedModels = models.filter(model => model.model_id !== modelId);
          localStorage.setItem('pairTradingModels', JSON.stringify(updatedModels));
          setModels(updatedModels);
        }
      } catch (error) {
        console.error('Error deleting model:', error);
      }
    }
  };
  
  return (
    <div className="dashboard">
      <h2>Your Pair Trading Models</h2>
      
      {isLoading ? (
        <div className="loading">Loading models...</div>
      ) : models.length === 0 ? (
        <div className="no-models">
          <p>You haven't created any pair trading models yet.</p>
          <Link href="/create" className="button primary">Create Your First Model</Link>
        </div>
      ) : (
        <div className="model-list">
          {models.map((model) => (
            <div key={model.model_id} className="model-card">
              <div className="model-header">
                <h3>{model.tickers.ticker1} / {model.tickers.ticker2}</h3>
                <div className="model-actions">
                  <Link href={`/model/${model.model_id}`} className="button secondary">View</Link>
                  <button 
                    className="button danger" 
                    onClick={() => deleteModel(model.model_id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="model-metrics">
                <div className="metric">
                  <span className="metric-label">Total Return</span>
                  <span className="metric-value">{(model.metrics.total_return * 100).toFixed(2)}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Annual Return</span>
                  <span className="metric-value">{(model.metrics.annual_return * 100).toFixed(2)}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Sharpe Ratio</span>
                  <span className="metric-value">{model.metrics.sharpe_ratio.toFixed(2)}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Max Drawdown</span>
                  <span className="metric-value">{(model.metrics.max_drawdown * 100).toFixed(2)}%</span>
                </div>
              </div>
              <div className="model-dates">
                <span>Period: {model.data_summary.start_date} to {model.data_summary.end_date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="dashboard-actions">
        <Link href="/create" className="button primary">Create New Model</Link>
      </div>
    </div>
  );
}