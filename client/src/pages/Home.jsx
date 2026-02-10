import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, FileText, ArrowRight, Sparkles, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import './Home.css';

/* --- ANIMATION VARIANTS --- */
const containerVars = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVars = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0, opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

const letterVars = {
  hidden: { y: 15, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const AnimatedTitle = ({ text }) => (
  <motion.h1 className="stagger-title" variants={containerVars} initial="hidden" animate="visible">
    {text.split("").map((char, index) => (
      <motion.span key={index} variants={letterVars} style={{ display: "inline-block" }}>
        {char === " " ? "\u00A0" : char}
      </motion.span>
    ))}
  </motion.h1>
);

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content">

        {/* 1. HEADER */}
        <div className="home-header">
          <motion.div
            className="badge-pill"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          >
            <Sparkles size={14} /> Supplier Dashboard
          </motion.div>

          <AnimatedTitle text="Welcome back!" />

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            Track deliveries, manage clients, and view history.
          </motion.p>
        </div>

        {/* 2. DASHBOARD GRID */}
        <motion.div
          className="dashboard-grid"
          variants={containerVars}
          initial="hidden"
          animate="visible"
        >

          {/* LEFT: BIG HERO CARD */}
          <motion.div
            className="hero-card"
            variants={itemVars}
            onClick={() => navigate('/calculator')}
          >
            <div className="hero-deco deco-1"></div>
            <div className="hero-deco deco-2"></div>

            <div className="hero-content-top">
              <div className="hero-icon-box">
                <Calculator size={40} color="white" strokeWidth={1.5} />
              </div>
              <div className="hero-text">
                <h2>Daily Entry</h2>
                <p>Calculate & save today's bill.</p>
              </div>
            </div>

            <div className="hero-btn">
              Open Calculator <ArrowRight size={18} />
            </div>
          </motion.div>

          {/* RIGHT: SIDE COLUMN */}
          <div className="side-column">

            {/* History Card */}
            <motion.div
              className="action-card"
              variants={itemVars}
              onClick={() => navigate('/bills')}
            >
              <div className="card-left">
                <div className="icon-square history-icon">
                  <FileText size={24} />
                </div>
                <div className="card-info">
                  <h3>History</h3>
                  <p>View past transactions</p>
                </div>
              </div>
              <ArrowRight size={20} className="arrow-icon" />
            </motion.div>

            {/* Clients Card */}
            <motion.div
              className="action-card"
              variants={itemVars}
              onClick={() => navigate('/clients')}
            >
              <div className="card-left">
                <div className="icon-square clients-icon">
                  <Users size={24} />
                </div>
                <div className="card-info">
                  <h3>Clients</h3>
                  <p>Manage customers</p>
                </div>
              </div>
              <ArrowRight size={20} className="arrow-icon" />
            </motion.div>

          </div>

        </motion.div>

      </div>
    </div>
  );
};

export default Home;