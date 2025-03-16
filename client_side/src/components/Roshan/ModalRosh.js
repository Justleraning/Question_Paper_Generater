import React from 'react';

// Modal component for confirmation popups
const ModalRosh = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '80%',
          maxWidth: '500px',
          padding: '20px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
          borderBottom: '1px solid #eee',
          paddingBottom: '10px'
        }}>
          <h3 style={{ margin: 0, color: '#333' }}>{title}</h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#555'
            }}
          >
            ×
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalRosh;