import { useEffect, useRef } from 'react';
import './DebateAgentCard.css';
import AgentOrb from './AgentOrb';

function DebateAgentCard({ name, role, themeColor, themeRgb, isActive, transcripts }) {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom of transcripts
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  return (
    <div 
      className={`debate-agent-card ${isActive ? 'active' : ''}`}
      style={{
        '--theme-color': themeColor,
        '--theme-rgb': themeRgb
      }}
    >
      <div className="debate-agent-header">
        <h2 className="debate-agent-name">{name}</h2>
        <div className="debate-agent-role">{role}</div>
      </div>

      <div className={`debate-visual-container ${isActive ? 'active' : ''}`}>
        <AgentOrb />
      </div>

      <div className="debate-transcript-panel" ref={scrollRef}>
        <div className="debate-transcript-header">Transcription</div>
        <div className="debate-messages">
          {transcripts.map((msg, idx) => {
            const isLatest = idx === transcripts.length - 1;
            return (
              <div 
                key={idx} 
                className={`debate-message ${isLatest ? 'latest' : 'older'}`}
              >
                {msg}
              </div>
            );
          })}
          {transcripts.length === 0 && (
            <div className="debate-message older" style={{ fontStyle: 'italic' }}>
              Waiting to speak...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DebateAgentCard;
