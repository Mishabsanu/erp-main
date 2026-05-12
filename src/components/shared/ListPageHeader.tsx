'use client';

import type { ReactNode } from 'react';

type ListPageHeaderProps = {
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  actions?: ReactNode;
  className?: string;
};

export default function ListPageHeader({
  eyebrow,
  title,
  highlight,
  description,
  actions,
  className = '',
}: ListPageHeaderProps) {
  return (
    <div className={`page-header ${className}`}>
      <div>
        <div className="page-header-eyebrow">
          <div className="page-header-marker" />
          <span>{eyebrow}</span>
        </div>
        <h1 className="page-header-title">
          {title} <span className="gradient-text">{highlight}</span>
        </h1>
        <p className="page-header-description">{description}</p>
      </div>

      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}
