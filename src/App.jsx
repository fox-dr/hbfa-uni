import React, { useState } from 'react'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Operations from './pages/Operations'
import Sales from './pages/Sales'
import Reports from './pages/Reports'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')

  const renderView = () => {
    switch (currentView) {
      case 'operations':
        return <Operations />
      case 'sales':
        return <Sales />
      case 'reports':
        return <Reports />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="app">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  )
}

export default App