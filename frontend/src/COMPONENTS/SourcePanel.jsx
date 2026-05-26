function SourcePanel({ sources }) {
  return (
    <div style={styles.panel}>
      <h3 style={styles.title}>📌 References</h3>
      {sources && sources.length > 0 ? (
        <div style={styles.sourceList}>
          {sources.map((src, index) => (
            <div key={index} style={styles.sourceCard}>
              <span style={styles.badge}>Excerpt #{index + 1}</span>
              <p style={styles.text}>"{src.text}"</p>
              {src.page && <small style={styles.page}>Page: {src.page}</small>}
            </div>
          ))}
        </div>
      ) : (
        <p style={styles.empty}>PDF excerpts used by the AI will appear here.</p>
      )}
    </div>
  );
}

const styles = {
  panel: { width: '300px', backgroundColor: '#fdfdfd', borderLeft: '1px solid #ddd', padding: '20px', height: '100vh', position: 'fixed', right: 0, top: 0, overflowY: 'auto', boxShadow: '-2px 0 5px rgba(0,0,0,0.05)' },
  title: { fontSize: '18px', color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '10px', marginBottom: '20px' },
  sourceList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  sourceCard: { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  badge: { backgroundColor: '#e7f3ff', color: '#007bff', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' },
  text: { fontSize: '13px', color: '#555', fontStyle: 'italic', margin: '10px 0' },
  page: { color: '#888', fontSize: '11px' },
  empty: { color: '#aaa', fontSize: '14px', textAlign: 'center', marginTop: '50px' }
};

export default SourcePanel;
