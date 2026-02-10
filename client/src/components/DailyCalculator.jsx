import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, Calculator, ArrowLeft, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import './DailyCalculator.css';

const DailyCalculator = () => {
  const navigate = useNavigate();

  // Data State
  const [items, setItems] = useState([{ id: 1, name: '', weight: '', price: '', total: 0 }]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Clients & Products on Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientRes = await api.get('/clients');
        setClients(clientRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };
    fetchData();
  }, []);

  // --- Calculations ---
  const calculateTotal = (weight, price) => {
    const w = parseFloat(weight) || 0;
    const p = parseFloat(price) || 0;
    return (w * p).toFixed(2);
  };

  const grandTotal = items.reduce((acc, item) => acc + (parseFloat(item.total) || 0), 0);

  // --- Handlers ---
  const handleItemChange = (id, field, value) => {
    const newItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'weight' || field === 'price') {
          updatedItem.total = calculateTotal(
            field === 'weight' ? value : item.weight,
            field === 'price' ? value : item.price
          );
        }
        return updatedItem;
      }
      return item;
    });
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), name: '', weight: '', price: '', total: 0 }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleSave = async () => {
    if (!selectedClient) return alert("Please select a client!");
    if (grandTotal <= 0) return alert("Total cannot be zero!");

    setIsSaving(true);
    try {
      await api.post('/transactions', {
        client_id: selectedClient,
        total_amount: grandTotal,
        items: items.filter(i => i.name && i.total > 0),
        date: date
      });
      navigate('/bills'); // Redirect to history after save
    } catch (err) {
      alert("Failed to save bill.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="calculator-container">

      {/* 1. FIXED HEADER */}
      <div className="calc-header">
        <div className="calc-title" onClick={() => navigate('/')} style={{cursor:'pointer'}}>
          <ArrowLeft size={20} /> Daily Entry
        </div>
        <input
          type="date"
          className="date-picker"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{padding:'6px', borderRadius:'6px', border:'1px solid #cbd5e1'}}
        />
      </div>

      {/* 2. SCROLLABLE BODY */}
      <div className="calc-body">

        {/* Client Selector */}
        <div style={{marginBottom:'20px'}}>
            <label style={{display:'block', marginBottom:'8px', fontWeight:'600', color:'#475569'}}>Select Client</label>
            <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #cbd5e1', fontSize:'1rem'}}
            >
                <option value="">-- Choose Client --</option>
                {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
        </div>

        {/* Item List */}
        {items.map((item, index) => (
          <div key={item.id} className="input-row">
            {/* Name */}
            <input
              placeholder="Item Name"
              value={item.name}
              onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
            />
            {/* Weight */}
            <input
              type="number"
              placeholder="Kg"
              value={item.weight}
              onChange={(e) => handleItemChange(item.id, 'weight', e.target.value)}
            />
            {/* Price */}
            <input
              type="number"
              placeholder="₹/Kg"
              value={item.price}
              onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
            />
            {/* Remove Btn */}
            <button className="remove-btn" onClick={() => removeItem(item.id)}>
              <Trash2 size={16} />
            </button>

            {/* Line Total (Small Display below inputs for clarity) */}
            <div style={{gridColumn:'1 / -1', textAlign:'right', fontSize:'0.85rem', color:'#64748b', marginTop:'-5px'}}>
               Total: ₹{item.total || 0}
            </div>
          </div>
        ))}

        <button className="add-item-btn" onClick={addItem}>
          <Plus size={18} /> Add New Item
        </button>

      </div>

      {/* 3. FIXED FOOTER (Total & Save) */}
      <div className="calc-footer">
        <div className="total-display">
          <span>Grand Total</span>
          <span className="total-amount">₹ {grandTotal.toFixed(2)}</span>
        </div>

        <div className="action-buttons">
          <button className="btn-secondary" onClick={() => setItems([{ id: Date.now(), name: '', weight: '', price: '', total: 0 }])}>
            <RefreshCw size={18} /> Reset
          </button>

          <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : <><Save size={18} /> Save Bill</>}
          </button>
        </div>
      </div>

    </div>
  );
};

export default DailyCalculator;