import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';

const IconLegend = styled.div`
  margin: 1rem 0 0.5rem 0;
  padding: 0.75rem;
  background: ${colors.backgroundLighter};
  border-radius: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  font-size: 0.9rem;
  width: 100%;
  box-sizing: border-box;
  
  .legend-title {
    font-weight: bold;
    color: ${colors.primary};
    margin-right: 0.5rem;
    width: 100%;
    flex-shrink: 0;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    position: relative;
    cursor: help;
    padding: 0.25rem 0.5rem;
    border-radius: 3px;
    transition: background 0.2s ease;
    flex-shrink: 0;
    white-space: nowrap;
    
    &:hover {
      background: ${colors.background};
      
      .tooltip {
        opacity: 1;
        visibility: visible;
      }
    }
    
    .icon {
      font-size: 1.1rem;
    }
    
    .label {
      color: ${colors.textColorSecondary};
      font-size: 0.85rem;
    }
    
    .tooltip {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: ${colors.background};
      border: 1px solid ${colors.primary};
      border-radius: 4px;
      color: ${colors.textColor};
      font-size: 0.8rem;
      white-space: normal;
      width: fit-content;
      max-width: 280px;
      min-width: 150px;
      box-sizing: border-box;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s ease, visibility 0.2s ease;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      pointer-events: none;
      text-align: center;
      line-height: 1.4;
      word-wrap: break-word;
      
      &::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 5px solid transparent;
        border-top-color: ${colors.primary};
      }
    }
  }
`;

const StatusIconLegend = (): JSX.Element => {
  return (
    <IconLegend>
      <span className="legend-title">📊 Status Icons Legend:</span>
      <div className="legend-item">
        <span className="icon">✅</span>
        <span className="label">Success</span>
        <span className="tooltip">Job completed successfully with satisfactory results</span>
      </div>
      <div className="legend-item">
        <span className="icon">🔘</span>
        <span className="label">N/A</span>
        <span className="tooltip">Resource not available on target (not an error)</span>
      </div>
      <div className="legend-item">
        <span className="icon">❌</span>
        <span className="label">Error</span>
        <span className="tooltip">Technical error: timeout, network, or code issue</span>
      </div>
      <div className="legend-item">
        <span className="icon">⏸️</span>
        <span className="label">Timeout</span>
        <span className="tooltip">Job exceeded maximum execution time</span>
      </div>
      <div className="legend-item">
        <span className="icon">⏭️</span>
        <span className="label">Skipped</span>
        <span className="tooltip">Job skipped: missing API key or disabled</span>
      </div>
      <div className="legend-item">
        <span className="icon">🔄</span>
        <span className="label">Loading</span>
        <span className="tooltip">Job is currently running</span>
      </div>
    </IconLegend>
  );
};

export default StatusIconLegend;
