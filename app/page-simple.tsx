export default function HomePage() {
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: '1.6'
    }}>
      <h1 style={{ color: '#0070f3', marginBottom: '20px' }}>
        🎢 ParkGenius
      </h1>
      
      <h2 style={{ color: '#666', marginBottom: '30px' }}>
        AI-Powered Theme Park Planning Service
      </h2>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>✅ Deployment Status: SUCCESS</h3>
        <p>Your ParkGenius application has been successfully deployed!</p>
        <p><strong>Built:</strong> {new Date().toLocaleString()}</p>
        <p><strong>Framework:</strong> Next.js 14.0.3</p>
        <p><strong>React:</strong> 18.2.0</p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>🚀 Next Steps:</h3>
        <ul>
          <li>Add Supabase environment variables</li>
          <li>Configure park data</li>
          <li>Enable full feature set</li>
        </ul>
      </div>

      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        background: '#e7f3ff', 
        borderRadius: '5px' 
      }}>
        <strong>🎯 This proves the deployment infrastructure works!</strong>
        <br />
        Now we can add back the full features gradually.
      </div>
    </div>
  );
}