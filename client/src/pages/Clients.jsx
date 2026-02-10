import React, { useState, useEffect } from 'react';
import { UserPlus, Phone, Edit2, Check, X, User } from 'lucide-react';
import api from '../api/axios';
import '../components/DailyCalculator.css'; // Reusing global styles

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // If null, we are adding. If set, we are editing.

  // Form State
  const [formData, setFormData] = useState({ name: '', phone: '' });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch (err) { console.error(err); }
  };

  // Open Form for NEW Client
  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ name: '', phone: '' });
    setIsFormOpen(true);
  };

  // Open Form for EDIT Client
  const handleEdit = (client) => {
    setEditingId(client.id);
    setFormData({ name: client.name, phone: client.phone || '' });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // UPDATE Existing
        await api.put(`/clients/${editingId}`, formData);
      } else {
        // CREATE New
        await api.post('/clients', formData);
      }

      // Reset & Refresh
      setIsFormOpen(false);
      loadClients();
    } catch (err) {
      alert("Operation failed. Check console.");
    }
  };

  return (
    <div className="page-wrapper">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem 1rem' }}>
        <div>
          <h2 style={{ color: '#064e3b', margin: 0, fontSize: '1.5rem' }}>Clients</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{clients.length} Restaurants Active</p>
        </div>

        <button
          onClick={handleAddNew}
          style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
          }}
        >
          <UserPlus size={20} />
          <span>ADD NEW</span>
        </button>
      </div>

      {/* Add/Edit Form (Modal Style Overlay) */}
      {isFormOpen && (
        <div style={{ padding: '0 1rem' }}>
          <form onSubmit={handleSubmit} className="item-card" style={{ border: '2px solid #10b981', background: '#f0fdf4' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#064e3b' }}>
                {editingId ? 'Edit Details' : 'Add New Restaurant'}
              </h3>
              <button type="button" onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div className="input-group">
              <input
                className="modern-input"
                placeholder="Restaurant Name"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                style={{ marginBottom: '10px' }}
              />
            </div>

            <div className="input-group">
              <input
                className="modern-input"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                style={{ marginBottom: '15px' }}
              />
            </div>

            <button type="submit" className="save-btn" style={{ width: '100%', justifyContent: 'center' }}>
              <Check size={20} /> {editingId ? 'Update Client' : 'Save Client'}
            </button>
          </form>
        </div>
      )}

      {/* Client List */}
      <div style={{ marginTop: '1rem', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {clients.map(client => (
          <div key={client.id} className="history-card" style={{ margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

            {/* Info Section */}
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1f2937' }}>{client.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                <Phone size={14}/> {client.phone || 'No Phone'}
              </div>
            </div>

            {/* Right Side: Balance & Edit */}
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <span style={{
                color: client.current_balance > 0 ? '#ef4444' : '#10b981',
                fontWeight: '800', fontSize: '1.1rem'
              }}>
                ₹{client.current_balance || 0}
              </span>

              <button
                onClick={() => handleEdit(client)}
                style={{
                  background: '#e2e8f0', border: 'none', padding: '6px 12px',
                  borderRadius: '8px', color: '#475569', fontSize: '0.8rem', fontWeight: '600',
                  display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer'
                }}
              >
                <Edit2 size={14} /> Edit
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Clients;