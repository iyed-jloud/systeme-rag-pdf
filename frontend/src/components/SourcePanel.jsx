function SourcePanel({ sources, isOpen, onClose }) {
  return (
    <>
      <button
        className={`source-backdrop ${isOpen ? 'is-open' : ''}`}
        type="button"
        aria-label="Close references"
        onClick={onClose}
      />
      <aside className={`source-panel ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
        <div className="source-header">
          <div>
            <p className="eyebrow">Evidence</p>
            <h2>References</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close references">
            x
          </button>
        </div>

        <div className="source-list">
          {sources.map((src, index) => (
            <article className="source-card" key={`${src.source || 'source'}-${src.page || index}-${index}`}>
              <span>Excerpt {index + 1}</span>
              <strong>{src.source || 'Unknown PDF'}</strong>
              <p>{src.text}</p>
              {src.page && <small>Page {src.page}</small>}
            </article>
          ))}
        </div>
      </aside>
    </>
  );
}

export default SourcePanel;
