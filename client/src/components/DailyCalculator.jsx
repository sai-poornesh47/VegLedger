import React, { useState, useEffect, useRef } from 'react';
import { Search, X, CheckCircle, ChevronDown, User, Plus, Minus, Building2, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import './DailyCalculator.css';

const DailyCalculator = () => {
  // --- STATE ---
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);

  // Dropdown Logic
  const [isClientOpen, setIsClientOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Modal Logic (Weight Entry)
  const [activeVeggie, setActiveVeggie] = useState(null);
  const [currentWeight, setCurrentWeight] = useState(1);

  // Bill Review Modal Logic
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Saving Logic
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // --- EFFECTS ---
  useEffect(() => {
    const load = async () => {
      try {
        const [c, p] = await Promise.all([api.get('/clients'), api.get('/products')]);
        setClients(c.data);
        setProducts(p.data);
        if (c.data.length > 0) setSelectedClientId(c.data[0].id);
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  useEffect(() => {
    const clickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsClientOpen(false);
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  // --- ACTIONS ---

  // 1. Add/Edit Item (Opens Weight Modal)
  const openModal = (p) => {
    const exist = cart.find(i => i.name === p.name);
    setCurrentWeight(exist ? exist.weight : 1);
    setActiveVeggie(p);
  };

  const confirmWeight = () => {
    if (!activeVeggie) return;
    setCart(prev => {
      const rest = prev.filter(i => i.name !== activeVeggie.name);
      return [...rest, {
        id: activeVeggie.id, name: activeVeggie.name, emoji: activeVeggie.icon_emoji,
        weight: parseFloat(currentWeight), price: parseFloat(activeVeggie.default_price),
        total: (parseFloat(currentWeight) * parseFloat(activeVeggie.default_price)).toFixed(2)
      }];
    });
    setActiveVeggie(null);
  };

  // 2. Adjust Item inside Review Modal
  const adjustCartItem = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newWeight = Math.max(0.5, item.weight + delta);
        return {
          ...item,
          weight: newWeight,
          total: (newWeight * item.price).toFixed(2)
        };
      }
      return item;
    }));
  };

  const removeCartItem = (id) => {
    const newCart = cart.filter(item => item.id !== id);
    setCart(newCart);
    if (newCart.length === 0) setIsReviewOpen(false); // Close modal if empty
  };

  // 3. Save Final Order
  const handleSave = async () => {
    if (!selectedClientId) return alert("Select Client");
    setIsSaving(true);
    try {
      await api.post('/transactions', {
        client_id: parseInt(selectedClientId),
        total_amount: cart.reduce((acc, i) => acc + parseFloat(i.total), 0),
        items: cart, date: new Date()
      });
      setIsSaving(false);
      setIsReviewOpen(false); // Close review modal
      setShowSuccess(true);
      setTimeout(() => { setShowSuccess(false); setCart([]); }, 2000);
    } catch { setIsSaving(false); alert("Error saving bill"); }
  };

  const currentClient = clients.find(c => c.id == selectedClientId) || {};
  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const grandTotal = cart.reduce((acc, i) => acc + parseFloat(i.total), 0);

  return (
    <div className="pos-container">

      {/* 1. HEADER */}
      <div className="glass-header">
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>

          {/* CUSTOM DROPDOWN */}
          <div className="client-dropdown-container" ref={dropdownRef}>
            <div className="dropdown-trigger" onClick={() => setIsClientOpen(!isClientOpen)}>
              <div className="trigger-content">
                <div className="trigger-icon-box"><Building2 size={20}/></div>
                <div className="trigger-text-group">
                  <span className="label-tiny">Billing To</span>
                  <span className="label-main">{currentClient.name || "Select..."}</span>
                </div>
              </div>
              <ChevronDown size={18} color="#94a3b8" />
            </div>

            <AnimatePresence>
              {isClientOpen && (
                <motion.div
                  className="custom-dropdown-menu"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                >
                  {clients.map(c => (
                    <div
                      key={c.id}
                      className={`dropdown-item ${selectedClientId == c.id ? 'selected' : ''}`}
                      onClick={() => { setSelectedClientId(c.id); setIsClientOpen(false); }}
                    >
                      <div className="item-initial">{c.name.charAt(0)}</div>
                      <span style={{fontWeight: selectedClientId == c.id ? '700' : '500'}}>{c.name}</span>
                      {selectedClientId == c.id && <CheckCircle size={16} color="#10b981" style={{marginLeft:'auto'}}/>}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SEARCH */}
          <div className="search-input-wrapper" style={{ flex: 1 }}>
            <Search size={18} color="#94a3b8"/>
            <input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
          </div>
        </div>
      </div>

      {/* 2. GRID */}
      <div className="pro-grid">
        {filtered.map(p => {
          const inCart = cart.find(i => i.name === p.name);
          return (
            <motion.div
              key={p.id} className={`pro-card ${inCart ? 'in-cart' : ''}`}
              whileTap={{ scale: 0.95 }} onClick={() => openModal(p)}
            >
              <span className="pro-emoji">{p.icon_emoji}</span>
              <span className="pro-name">{p.name}</span>
              <span className="pro-price">₹{p.default_price}</span>
              {inCart && <div className="count-badge">{inCart.weight}</div>}
            </motion.div>
          );
        })}
      </div>

      {/* 3. WEIGHT INPUT MODAL */}
      <AnimatePresence>
        {activeVeggie && (
          <div className="modal-overlay" onClick={() => setActiveVeggie(null)}>
            <motion.div
              className="weight-modal"
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            >
              <button className="close-modal" onClick={() => setActiveVeggie(null)}><X size={20}/></button>

              <div className="modal-content-wrapper">
                <span className="modal-emoji">{activeVeggie.icon_emoji}</span>
                <h3 className="modal-title">{activeVeggie.name}</h3>
                <span className="modal-subtitle">Current Rate: ₹{activeVeggie.default_price}/kg</span>

                <div className="input-row-container">
                  <button className="round-btn" onClick={() => setCurrentWeight(prev => Math.max(0.5, prev - 0.5))}><Minus size={20}/></button>
                  <div className="input-display-box">
                    <input
                      type="number" className="big-input"
                      value={currentWeight}
                      onChange={e => setCurrentWeight(parseFloat(e.target.value))}
                      onFocus={e => e.target.select()}
                    />
                    <div className="unit-label">KG</div>
                  </div>
                  <button className="round-btn" onClick={() => setCurrentWeight(prev => prev + 0.5)}><Plus size={20}/></button>
                </div>

                <div className="chip-row">
                  <div className="chip" onClick={() => setCurrentWeight(prev => prev + 1)}>+1</div>
                  <div className="chip" onClick={() => setCurrentWeight(prev => prev + 2)}>+2</div>
                  <div className="chip" onClick={() => setCurrentWeight(prev => prev + 5)}>+5</div>
                </div>

                <button className="modal-save-btn" onClick={confirmWeight}>
                  Update Cart • ₹{(currentWeight * activeVeggie.default_price).toFixed(0)}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. GRAND TOTAL DOCK (Updated with View Bill) */}
      <AnimatePresence>
        {cart.length > 0 && !isReviewOpen && (
          <motion.div className="grand-dock" initial={{y:100}} animate={{y:0}} exit={{y:100}}>
            <div className="dock-info">
              <span className="dock-label">{cart.length} ITEMS ADDED</span>
              <span className="dock-total">₹{grandTotal.toFixed(0)}</span>
            </div>

            <button className="view-bill-btn" onClick={() => setIsReviewOpen(true)}>
              View Bill <ShoppingBag size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. REVIEW BILL MODAL (New Feature) */}
      <AnimatePresence>
        {isReviewOpen && (
          <div className="modal-overlay" onClick={() => setIsReviewOpen(false)}>
            <motion.div
              className="bill-review-modal"
              onClick={e => e.stopPropagation()}
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="review-header">
                <h3>Current Bill</h3>
                <button className="close-icon-btn" onClick={() => setIsReviewOpen(false)}><X size={20}/></button>
              </div>

              <div className="review-list">
                {cart.map(item => (
                  <div key={item.id} className="review-item">
                    <div className="r-left">
                      <span className="r-emoji">{item.emoji}</span>
                      <div>
                        <div className="r-name">{item.name}</div>
                        <div className="r-rate">₹{item.price}/kg</div>
                      </div>
                    </div>

                    <div className="r-right">
                      <div className="r-stepper">
                        <button onClick={() => adjustCartItem(item.id, -0.5)}>-</button>
                        <span>{item.weight}</span>
                        <button onClick={() => adjustCartItem(item.id, 0.5)}>+</button>
                      </div>
                      <div className="r-total">₹{Math.round(item.total)}</div>
                      <button className="r-delete" onClick={() => removeCartItem(item.id)}><Trash2 size={18}/></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="review-footer">
                <div className="review-total-row">
                  <span>Grand Total</span>
                  <span>₹{grandTotal.toFixed(0)}</span>
                </div>
                <button className="final-save-btn" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'SAVE ORDER'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. SUCCESS SCREEN */}
      <AnimatePresence>
        {showSuccess && (
          <div className="success-screen">
            <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring'}}>
              <CheckCircle size={100} color="#10b981"/>
            </motion.div>
            <h1 style={{color:'#0f172a', marginTop:'20px'}}>Saved!</h1>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DailyCalculator;