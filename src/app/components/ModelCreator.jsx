"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function ModelCreator({ availableTickers = [] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [correlation, setCorrelation] = useState(null);
  
  const [formData, setFormData] = useState({
    ticker1: '',
    ticker2: '',
    lookback_period: 30,
    z_threshold: 2.0,
    start_date: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      start_date: date
    });
  };
  
  const validatePair = async () => {
    if (!formData.ticker1 || !formData.ticker2) {
      setError('Please select both tickers');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/validate_pair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ticker1: formData.ticker1,
          ticker2: formData.ticker2
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setCorrelation({
          value: data.correlation,
          is_valid: data.is_valid,
          message: data.message
        });
      } else {
        setError(data.message || 'Failed to validate pair');
      }
    } catch (error) {
      console.error('Error validating pair:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.ticker1 || !formData.ticker2) {
      setError('Please select both tickers');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/create_model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          start_date: formData.start_date.toISOString().split('T')[0]
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        // Save the model to localStorage
        const savedModels = JSON.parse(localStorage.getItem('pairTradingModels')) || [];
        savedModels.push(data.model);
        localStorage.setItem('pairTradingModels', JSON.stringify(savedModels));
        
        // Navigate to the model view using Next.js router
        router.push(`/model/${data.model.model_id}`);
      } else {
        setError(data.message || 'Failed to create model');
      }
    } catch (error) {
      console.error('Error creating model:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="model-creator">
      <h2>Create Pair Trading Model</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="ticker1">Stock 1:</label>
            <select
              id="ticker1"
              name="ticker1"
              value={formData.ticker1}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a stock</option>
              {availableTickers.map((ticker) => (
                <option key={ticker.symbol} value={ticker.symbol}>
                  {ticker.symbol} - {ticker.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="ticker2">Stock 2:</label>
            <select
              id="ticker2"
              name="ticker2"
              value={formData.ticker2}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a stock</option>
              {availableTickers.map((ticker) => (
                <option key={ticker.symbol} value={ticker.symbol}>
                  {ticker.symbol} - {ticker.name}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            type="button" 
            className="button secondary" 
            onClick={validatePair}
            disabled={isLoading || !formData.ticker1 || !formData.ticker2}
          >
            Check Correlation
          </button>
        </div>
        
        {correlation && (
          <div className={`correlation-result ${correlation.is_valid ? 'valid' : 'invalid'}`}>
            <p>{correlation.message}</p>
          </div>
        )}
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="lookback_period">Lookback Period (days):</label>
            <input
              type="number"
              id="lookback_period"
              name="lookback_period"
              value={formData.lookback_period}
              onChange={handleInputChange}
              min="10"
              max="252"
              required
            />
            <small>Recommended: 30-60 days</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="z_threshold">Z-Score Threshold:</label>
            <input
              type="number"
              id="z_threshold"
              name="z_threshold"
              value={formData.z_threshold}
              onChange={handleInputChange}
              step="0.1"
              min="0.5"
              max="3.0"
              required
            />
            <small>Recommended: 1.5-2.5</small>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="start_date">Start Date:</label>
            <DatePicker
              selected={formData.start_date}
              onChange={handleDateChange}
              maxDate={new Date()}
              showYearDropdown
              dateFormat="yyyy-MM-dd"
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="button primary" 
            disabled={isLoading}
          >
            {isLoading ? 'Creating Model...' : 'Create Model'}
          </button>
        </div>
      </form>
    </div>
  );
}