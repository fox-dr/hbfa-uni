import React from 'react'

const Dashboard = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Unified operations overview</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Operations</h3>
          <p>Milestone tracking and timeline management</p>
          <div className="dashboard-stats">
            <div className="stat">
              <span className="stat-value">--</span>
              <span className="stat-label">Active Projects</span>
            </div>
            <div className="stat">
              <span className="stat-value">--</span>
              <span className="stat-label">Units in Progress</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Sales</h3>
          <p>Unit inventory and status tracking</p>
          <div className="dashboard-stats">
            <div className="stat">
              <span className="stat-value">--</span>
              <span className="stat-label">Available Units</span>
            </div>
            <div className="stat">
              <span className="stat-value">--</span>
              <span className="stat-label">Closed Units</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Reports</h3>
          <p>Mylar PDFs and analytics</p>
          <div className="dashboard-stats">
            <div className="stat">
              <span className="stat-value">--</span>
              <span className="stat-label">Reports Generated</span>
            </div>
            <div className="stat">
              <span className="stat-value">--</span>
              <span className="stat-label">Last Updated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard