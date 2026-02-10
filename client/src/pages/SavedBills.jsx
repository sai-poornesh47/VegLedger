import React, { useState, useEffect } from 'react';
import { Search, Calendar, ChevronRight, X, Filter } from 'lucide-react';
import api from '../api/axios';
import './SavedBills.css'; // Import the new CSS

const SavedBills = () => {
  // --- STATE ---
  const [allBills, setAllBills] = useState([]); // Raw Data
  const [filteredBills, setFilteredBills] = useState([]); // Display Data
  const [clients, setClients] = useState([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // Default: Current YYYY-MM
  const [specificDate, setSpecificDate] = useState(''); // Optional specific day

  // Modal
  const [selectedBill, setSelectedBill] = useState(null);

  // --- LOAD DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [billsRes, clientsRes] = await Promise.all([
          api.get('/transactions/recent'), // Ensure this endpoint returns ample history
          api.get('/clients')
        ]);
        setAllBills(billsRes.data);
        setFilteredBills(billsRes.data);
        setClients(clientsRes.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  // --- FILTER ENGINE ---
  useEffect(() => {
    let result = allBills;

    // 1. Search Filter (Client Name)
    if (searchTerm) {
      result = result.filter(b =>
        b.client_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Date Filter
    if (specificDate) {
      // If user picked a specific day (YYYY-MM-DD)
      result = result.filter(b => b.transaction_date.startsWith(specificDate));
    } else if (selectedMonth) {
      // Fallback to Month (YYYY-MM)
      result = result.filter(b => b.transaction_date.startsWith(selectedMonth));
    }

    setFilteredBills(result);
  }, [searchTerm, selectedMonth, specificDate, allBills]);

  // --- HELPERS ---
  const openBill = async (id) => {
    try {
      const res = await api.get(`/transactions/${id}`);
      setSelectedBill(res.data);
    } catch (err) { alert("Error loading bill details"); }
  };

  const totalRevenue = filteredBills.reduce((acc, b) => acc + parseFloat(b.total_amount), 0);

  // Date Formatter
  const formatDateBox = (dateStr) => {
    const d = new Date(dateStr);
    return {
      day: d.getDate(),
      month: d.toLocaleString('default', { month: 'short' })
    };
  };

  return (
    <div className="history-page">

      {/* 1. HEADER */}
      <div className="page-header">
        <h1 className="page-title">Transaction History</h1>
        <p className="page-subtitle">Track, filter, and audit your past deliveries.</p>
      </div>

      {/* 2. CONTROL BAR (FILTERS) */}
      <div className="filter-bar">
        {/* Search */}
        <div className="search-wrapper">
          <Search size={18} color="#94a3b8" />
          <input
            placeholder="Search Client Name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Month Filter */}
        <input
          type="month"
          className="date-filter"
          value={selectedMonth}
          onChange={e => { setSelectedMonth(e.target.value); setSpecificDate(''); }} // Clear specific date if month changes
        />

        {/* Specific Date (Optional) */}
        <input
          type="date"
          className="date-filter"
          value={specificDate}
          onChange={e => setSpecificDate(e.target.value)}
          placeholder="Specific Date"
        />
      </div>

      {/* 3. INSIGHT CARDS */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-label">Total Revenue</span>
          <span className="stat-value highlight">₹{totalRevenue.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Transactions</span>
          <span className="stat-value">{filteredBills.length}</span>
        </div>
      </div>

      {/* 4. THE LIST */}
      <div className="trans-list">
        {filteredBills.length === 0 ? (
          <div style={{textAlign:'center', color:'#94a3b8', marginTop:'40px'}}>
            No bills found for this period.
          </div>
        ) : (
          filteredBills.map(bill => {
            const dateObj = formatDateBox(bill.transaction_date);
            return (
              <div key={bill.id} className="trans-card" onClick={() => openBill(bill.id)}>
                <div className="trans-left">
                  <div className="date-box">
                    <span className="date-day">{dateObj.day}</span>
                    <span className="date-month">{dateObj.month}</span>
                  </div>
                  <div className="trans-info">
                    <h4>{bill.client_name}</h4>
                    <p>ID: #{bill.id} • {new Date(bill.transaction_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
                <div className="trans-right">
                  <span className="trans-amount">₹{Math.round(bill.total_amount)}</span>
                  <div className="view-link">View <ChevronRight size={14}/></div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. INVOICE MODAL */}
      {selectedBill && (
        <div className="invoice-modal-overlay" onClick={() => setSelectedBill(null)}>
          <div className="invoice-paper" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="invoice-header">
              <div className="invoice-title">Official Receipt</div>
              <h2 className="client-name-large">{selectedBill.client_name}</h2>
              <div className="invoice-date">
                {new Date(selectedBill.transaction_date).toLocaleDateString()} • {new Date(selectedBill.transaction_date).toLocaleTimeString()}
              </div>
            </div>

            {/* Bill Items */}
            <div className="invoice-body">
              {selectedBill.items.map((item, idx) => (
                <div key={idx} className="line-item">
                  <div>
                    <div className="line-name">{item.product_name || item.name}</div>
                    <span className="line-meta">{item.weight}kg x ₹{item.price || item.price_per_kg}</span>
                  </div>
                  <div className="line-total">₹{Math.round(item.total || item.total_cost)}</div>
                </div>
              ))}
            </div>

            {/* Footer Total */}
            <div className="invoice-footer">
              <span className="footer-label">Grand Total Paid</span>
              <span className="footer-total">₹{Math.round(selectedBill.total_amount)}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SavedBills;