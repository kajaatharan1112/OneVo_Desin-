import React from 'react';

interface DashboardCardProps {
  title?: string;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  scroll?: boolean;
  variant?: 'default' | 'chart';
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  header,
  icon,
  action,
  scroll = false,
  variant = 'default',
  className = '',
  children,
  ariaLabel
}) => {
  const cardClassName = [
    'emp-dash-card',
    variant === 'chart' ? 'emp-dash-card--chart' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');
  const bodyClassName = ['emp-dash-card__body', scroll ? 'emp-dash-card__body--scroll' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <article className={cardClassName} aria-label={ariaLabel ?? title}>
      <header className="emp-dash-card__head">
        {header ?? (
          <>
            {icon ? <span className="emp-dash-card__icon">{icon}</span> : null}
            {title ? <h3 className="emp-dash-card__title">{title}</h3> : null}
            {action ? <div className="emp-dash-card__action">{action}</div> : null}
          </>
        )}
      </header>
      <div className={bodyClassName}>{children}</div>
    </article>
  );
};
