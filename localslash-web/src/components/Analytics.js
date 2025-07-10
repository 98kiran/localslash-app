import React from 'react';
import { BarChart3, TrendingUp, Users, Calendar } from 'lucide-react';

const Analytics = ({ store, deals }) => {
  // Calculate analytics data
  const totalDeals = deals.length;
  const activeDeals = deals.filter(d => d.is_active).length;
  const totalRedemptions = deals.reduce((sum, deal) => sum + (deal.current_redemptions || 0), 0);
  const averageRedemptionRate = totalDeals > 0 
    ? ((totalRedemptions / deals.reduce((sum, deal) => sum + (deal.max_redemptions || 100), 0)) * 100).toFixed(1)
    : 0;
  
  // Mock data for charts (in a real app, this would come from the database)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }).reverse();
  
  const mockViews = [45, 52, 38, 65, 48, 72, 58];
  const mockRedemptions = [5, 8, 3, 12, 7, 15, 10];
  
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Analytics Dashboard</h2>
      
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Deals Created</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalDeals}</p>
              <p style={{ fontSize: '0.875rem', color: '#10b981' }}>
                {activeDeals} active
              </p>
            </div>
            <BarChart3 size={32} style={{ color: '#3b82f6' }} />
          </div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Redemptions</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalRedemptions}</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>All time</p>
            </div>
            <Users size={32} style={{ color: '#10b981' }} />
          </div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Avg. Redemption Rate</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{averageRedemptionRate}%</p>
              <p style={{ fontSize: '0.875rem', color: '#10b981' }}>↑ 12% from last month</p>
            </div>
            <TrendingUp size={32} style={{ color: '#f59e0b' }} />
          </div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Days Since Last Deal</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {deals.length > 0 
                  ? Math.floor((new Date() - new Date(deals[0].created_at)) / (1000 * 60 * 60 * 24))
                  : 'N/A'
                }
              </p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Keep them coming!</p>
            </div>
            <Calendar size={32} style={{ color: '#8b5cf6' }} />
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
        {/* Views Chart */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Deal Views - Last 7 Days</h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            {mockViews.map((views, index) => (
              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '100%',
                    backgroundColor: '#3b82f6',
                    borderRadius: '0.25rem 0.25rem 0 0',
                    height: `${(views / Math.max(...mockViews)) * 150}px`,
                    minHeight: '10px'
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{views}</span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{last7Days[index]}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Redemptions Chart */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Redemptions - Last 7 Days</h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            {mockRedemptions.map((redemptions, index) => (
              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '100%',
                    backgroundColor: '#10b981',
                    borderRadius: '0.25rem 0.25rem 0 0',
                    height: `${(redemptions / Math.max(...mockRedemptions)) * 150}px`,
                    minHeight: '10px'
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{redemptions}</span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{last7Days[index]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Top Performing Deals */}
      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', marginTop: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Top Performing Deals</h3>
        {deals.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
            Create deals to see performance metrics
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>Deal</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>Views</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>Redemptions</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>Conversion</th>
                </tr>
              </thead>
              <tbody>
                {deals.slice(0, 5).map((deal) => {
                  const views = Math.floor(Math.random() * 1000) + 100; // Mock data
                  const redemptions = deal.current_redemptions || 0;
                  const conversion = views > 0 ? ((redemptions / views) * 100).toFixed(1) : 0;
                  
                  return (
                    <tr key={deal.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.75rem' }}>{deal.title}</td>
                      <td style={{ padding: '0.75rem' }}>{views}</td>
                      <td style={{ padding: '0.75rem' }}>{redemptions}</td>
                      <td style={{ padding: '0.75rem' }}>{conversion}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;