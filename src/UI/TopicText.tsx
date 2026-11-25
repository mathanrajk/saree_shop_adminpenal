import React from 'react';
import './TopicText.css';

export interface TopicTextProps {
  topic: string;
  subtitle?: string;
  count?: number;
  badge?: string;
  align?: 'left' | 'center';
  className?: string;
  actions?: React.ReactNode;
}

const TopicText: React.FC<TopicTextProps> = ({
  topic,
  subtitle,
  count,
  badge,
  align = 'left',
  className = '',
  actions,
}) => {
  return (
    <div className={`topic-header ${align === 'center' ? 'topic-center' : ''} ${className}`.trim()}>
      <div className="topic-main-row">
        <div className="topic-title-wrapper">
          <span className="topic-accent-bar" aria-hidden="true" />
          <h2 className="topic-title">
            {topic}
            {typeof count === 'number' && (
              <span className="topic-count-pill">{count}</span>
            )}
          </h2>
          {badge && <span className="topic-badge">{badge}</span>}
        </div>
        {actions && <div className="topic-actions">{actions}</div>}
      </div>
      {subtitle && <p className="topic-subtitle">{subtitle}</p>}
      <div className="topic-divider" aria-hidden="true" />
    </div>
  );
};

export default TopicText;
