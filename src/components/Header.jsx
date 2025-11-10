import React from 'react'

const Header = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'operations', label: 'Operations' },
    { id: 'sales', label: 'Sales' },
    { id: 'reports', label: 'Reports' }
  ]

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">HBFA Unified Platform</h1>
        <nav className="nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Header