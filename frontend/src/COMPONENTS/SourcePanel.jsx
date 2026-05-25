function SourcePanel({ sources }) {
  return (
    <aside className="source-panel" aria-label="Sources consultees">
      <div className="panel-heading">
        <h2>Sources</h2>
        <span>{sources.length}</span>
      </div>

      {sources.length > 0 ? (
        <div className="source-list">
          {sources.map((source, index) => (
            <article key={`${source.page}-${index}`} className="source-card">
              <span>Extrait {index + 1}</span>
              <p>{source.text}</p>
              {source.page && <small>Page {source.page}</small>}
            </article>
          ))}
        </div>
      ) : (
        <p className="empty-state">
          Les extraits utilises par l'IA apparaitront ici pendant vos tests.
        </p>
      )}
    </aside>
  );
}

export default SourcePanel;
