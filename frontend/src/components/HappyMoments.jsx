import React, { useState } from 'react';

const HappyMoments = ({ moments, onAddMoment }) => {
  const [momentText, setMomentText] = useState('');
  const [expanded, setExpanded] = useState({});
  const [showAll, setShowAll] = useState(false);

  const handleSubmit = () => {
    if (momentText.trim()) {
      onAddMoment(momentText.trim());
      setMomentText('');
    }
  };

  const handleKeyDown = (e) => {
    // submit on Ctrl/Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="happy-moments">
      <textarea
        className="moment-textarea"
        placeholder="Share a happy moment...✨"
        value={momentText}
        onChange={(e) => setMomentText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={5}
        style={{ resize: 'vertical' }}
      />
      <button 
        className="moment-submit-btn"
        onClick={handleSubmit}
        disabled={!momentText.trim()}
      >
        Add Moment
      </button>

      <div className="moments-list">
        {moments && moments.length > 0 ? (
          (showAll ? moments : [moments[0]]).map((moment) => {
            const isExpanded = !!expanded[moment.id];
            const shouldShowMore = moment.text && moment.text.length > 180;
            return (
              <div key={moment.id} className="moment-item">
                <span className="moment-icon">✨</span>
                <div className="moment-content">
                  <p className={`moment-text ${isExpanded ? 'expanded' : 'collapsed'}`}>
                    {moment.text}
                  </p>
                  <p className="moment-date">{moment.date}</p>
                  {shouldShowMore && (
                    <button
                      className="read-more-btn"
                      onClick={() => setExpanded(prev => ({...prev, [moment.id]: !prev[moment.id]}))}
                    >
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
              </div>
            );
          }))
           : (
          <p className="no-moments">No happy moments yet. Create one!</p>
          )
        }
      </div>
      {moments && moments.length > 1 && (
        <button
          className="show-more-toggle"
          onClick={() => setShowAll(prev => !prev)}
        >
          {showAll ? 'Show less' : `Show more`}
        </button>
      )}
    </div>
  );
};

export default HappyMoments;