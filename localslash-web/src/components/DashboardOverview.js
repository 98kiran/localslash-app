import React from 'react';
import { ShoppingBag, Eye, CheckCircle, TrendingUp } from 'lucide-react';

const DashboardOverview = ({ store, deals }) => {
  const activeDeals = deals.filter(d => d.is_active);
  const totalRedemptions = deals.reduce((sum, deal) => sum + (deal.current_redemptions || 0), 0);
  
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Dashboard Overview</h2>
      
      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Active Deals</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{activeDeals.length}</p>
            </div>
            <ShoppingBag size={32} style={{ color: '#10b981' }} />
          </div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Views</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>0</p>
            </div>
            <Eye size={32} style={{ color: '#3b82f6' }} />
          </div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Redemptions</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalRedemptions}</p>
            </div>
            <CheckCircle size={32} style={{ color: '#f59e0b' }} />
          </div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Conversion Rate</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>0%</p>
            </div>
            <TrendingUp size={32} style={{ color: '#8b5cf6' }} />
          </div>
        </div>
      </div>
      
      {/* Recent deals */}
      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Recent Deals</h3>
        {deals.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
            No deals yet. Create your first deal to start attracting customers!
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>Title</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>Discount</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>Redemptions</th>
                </tr>
              </thead>
              <tbody>
                {deals.slice(0, 5).map((deal) => (
                  <tr key={deal.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.75rem' }}>{deal.title}</td>
                    <td style={{ padding: '0.75rem' }}>
                      {deal.discount_percentage ? `${deal.discount_percentage}%` : `$${deal.discount_price}`}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        backgroundColor: deal.is_active ? '#d1fae5' : '#fee2e2',
                        color: deal.is_active ? '#065f46' : '#991b1b'
                      }}>
                        {deal.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {deal.current_redemptions || 0} / {deal.max_redemptions || '∞'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;