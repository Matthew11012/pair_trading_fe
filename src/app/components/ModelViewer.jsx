"use client"
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { useParams } from 'next/navigation';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar, Area } from 'recharts';

export default function ModelViewer() {
  const { modelId } = useParams();
  const [model, setModel] = useState(null);
  const [modelData, setModelData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch model summary from localStorage and detailed data from API
  useEffect(() => {
    async function fetchModelData() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get model summary from localStorage
        const savedModels = JSON.parse(localStorage.getItem('pairTradingModels')) || [];
        const modelSummary = savedModels.find(m => m.model_id === modelId);
        
        if (!modelSummary) {
          setError('Model not found');
          setIsLoading(false);
          return;
        }
        
        setModel(modelSummary);
        
        // Fetch detailed model data from API
        const response = await fetch(`http://localhost:5000/api/get_model_data/${modelId}`);
        const data = await response.json();
        
        if (data.status === 'success') {
          setModelData(data);
        } else {
          setError(data.message || 'Failed to load model data');
        }
      } catch (error) {
        console.error('Error loading model data:', error);
        setError('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchModelData();
  }, [modelId]);
  
  if (isLoading) {
    return <div className="loading">Loading model data...</div>;
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <Link href="/" className="button primary">Back to Dashboard</Link>
      </div>
    );
  }
  
  if (!model || !modelData) {
    return (
      <div className="error-container">
        <h2>Model Not Found</h2>
        <Link href="/" className="button primary">Back to Dashboard</Link>
      </div>
    );
  }
  
  const ticker1 = model.tickers.ticker1;
  const ticker2 = model.tickers.ticker2;
  
  return (
    <div className="model-viewer">
      <div className="model-header">
        <h2>{ticker1} / {ticker2} Pair Trading Model</h2>
        <div className="model-actions">
          <Link href="/" className="button secondary">Back to Dashboard</Link>
        </div>
      </div>
      
      <div className="model-summary">
        <div className="summary-section">
          <h3>Model Parameters</h3>
          <div className="parameters">
            <div className="parameter">
              <span className="parameter-label">Lookback Period:</span>
              <span className="parameter-value">{model.parameters.lookback_period} days</span>
            </div>
            <div className="parameter">
              <span className="parameter-label">Z-Score Threshold:</span>
              <span className="parameter-value">{model.parameters.z_threshold}</span>
            </div>
            <div className="parameter">
              <span className="parameter-label">Period:</span>
              <span className="parameter-value">{model.data_summary.start_date} to {model.data_summary.end_date}</span>
            </div>
            <div className="parameter">
              <span className="parameter-label">Trading Days:</span>
              <span className="parameter-value">{model.data_summary.num_trading_days}</span>
            </div>
          </div>
        </div>
        
        <div className="summary-section">
          <h3>Performance Metrics</h3>
          <div className="metrics">
            <div className="metric">
              <span className="metric-label">Total Return:</span>
              <span className="metric-value">{(model.metrics.total_return * 100).toFixed(2)}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Annual Return:</span>
              <span className="metric-value">{(model.metrics.annual_return * 100).toFixed(2)}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Sharpe Ratio:</span>
              <span className="metric-value">{model.metrics.sharpe_ratio.toFixed(2)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Max Drawdown:</span>
              <span className="metric-value">{(model.metrics.max_drawdown * 100).toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="model-tabs">
        <div className="tabs-header">
          <button 
            className={activeTab === 'overview' ? 'active' : ''} 
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'prices' ? 'active' : ''} 
            onClick={() => setActiveTab('prices')}
          >
            Price Data
          </button>
          <button 
            className={activeTab === 'spread' ? 'active' : ''} 
            onClick={() => setActiveTab('spread')}
          >
            Spread & Z-Score
          </button>
          <button 
            className={activeTab === 'signals' ? 'active' : ''} 
            onClick={() => setActiveTab('signals')}
          >
            Trading Signals
          </button>
          <button 
            className={activeTab === 'performance' ? 'active' : ''} 
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="tab-pane">
              <h3>Model Overview</h3>
              <p>This pair trading model analyzes the relationship between {ticker1} and {ticker2} using statistical arbitrage techniques.</p>
              
              <div className="chart-container">
                <h4>Portfolio Performance</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={modelData.performance_data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="portfolio_value" stroke="#8884d8" name="Portfolio Value" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="overview-sections">
                <div className="overview-section">
                  <h4>Strategy Explanation</h4>
                  <p>This pair trading strategy works on the principle of mean reversion between two correlated securities. When the spread between them deviates significantly from its historical mean, we take positions expecting the spread to revert back.</p>
                  <ul>
                    <li>When Z-Score &gt; {model.parameters.z_threshold}: Short {ticker2}, Long {ticker1}</li>
                    <li>When Z-Score &lt; -{model.parameters.z_threshold}: Long {ticker2}, Short {ticker1}</li>
                  </ul>
                </div>
                
                <div className="overview-section">
                  <h4>Key Insights</h4>
                  <ul>
                    <li>Total trading days: {model.data_summary.num_trading_days}</li>
                    <li>Total return: {(model.metrics.total_return * 100).toFixed(2)}%</li>
                    <li>Maximum drawdown: {(model.metrics.max_drawdown * 100).toFixed(2)}%</li>
                    <li>Risk-adjusted return (Sharpe): {model.metrics.sharpe_ratio.toFixed(2)}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'prices' && (
            <div className="tab-pane">
              <h3>Price Data</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={modelData.price_data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="ticker1_price" stroke="#8884d8" name={ticker1} />
                    <Line yAxisId="right" type="monotone" dataKey="ticker2_price" stroke="#82ca9d" name={ticker2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="price-analysis">
                <h4>Price Correlation Analysis</h4>
                <p>This chart shows the historical price movements of {ticker1} and {ticker2}. The correlation between these two securities forms the basis of our pair trading strategy.</p>
              </div>
            </div>
          )}
          
          {activeTab === 'spread' && (
            <div className="tab-pane">
              <h3>Spread & Z-Score</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={modelData.spread_data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="spread" stroke="#8884d8" name="Spread" />
                    <Line yAxisId="right" type="monotone" dataKey="z_score" stroke="#ff7300" name="Z-Score" />
                    <Area yAxisId="right" dataKey={() => model.parameters.z_threshold} stroke="red" fill="red" fillOpacity={0.1} name="Upper Threshold" />
                    <Area yAxisId="right" dataKey={() => -model.parameters.z_threshold} stroke="red" fill="red" fillOpacity={0.1} name="Lower Threshold" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="spread-analysis">
                <h4>Spread Analysis</h4>
                <p>The spread represents the difference between {ticker2} and the hedge ratio times {ticker1}. The z-score measures how many standard deviations the spread is from its mean.</p>
                <p>Trading signals are generated when the z-score crosses the threshold values of +/- {model.parameters.z_threshold}.</p>
              </div>
            </div>
          )}
          
          {activeTab === 'signals' && (
            <div className="tab-pane">
              <h3>Trading Signals</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={modelData.signal_data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[-1.5, 1.5]} ticks={[-1, 0, 1]} />
                    <Tooltip />
                    <Bar dataKey="signal" fill="#8884d8" name="Trading Signal" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="signal-analysis">
                <h4>Signal Analysis</h4>
                <p>This chart shows the trading signals generated by the model:</p>
                <ul>
                  <li><strong>1:</strong> Long {ticker2}, Short {ticker1}</li>
                  <li><strong>-1:</strong> Short {ticker2}, Long {ticker1}</li>
                  <li><strong>0:</strong> No position</li>
                </ul>
              </div>
            </div>
          )}
          
          {activeTab === 'performance' && (
            <div className="tab-pane">
              <h3>Performance Analysis</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={modelData.performance_data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 'dataMax']} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="portfolio_value" stroke="#8884d8" name="Portfolio Value" />
                    <Area yAxisId="right" type="monotone" dataKey={(entry) => Math.abs(entry.drawdown * 100)} stroke="#ff7300" fill="#ff7300" fillOpacity={0.3} name="Drawdown %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="performance-analysis">
                <h4>Performance Summary</h4>
                <table className="performance-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Starting Capital</td>
                      <td>$100,000</td>
                    </tr>
                    <tr>
                      <td>Final Portfolio Value</td>
                      <td>${(100000 * (1 + model.metrics.total_return)).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Total Return</td>
                      <td>{(model.metrics.total_return * 100).toFixed(2)}%</td>
                    </tr>
                    <tr>
                      <td>Annualized Return</td>
                      <td>{(model.metrics.annual_return * 100).toFixed(2)}%</td>
                    </tr>
                    <tr>
                      <td>Sharpe Ratio</td>
                      <td>{model.metrics.sharpe_ratio.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Maximum Drawdown</td>
                      <td>{(model.metrics.max_drawdown * 100).toFixed(2)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

