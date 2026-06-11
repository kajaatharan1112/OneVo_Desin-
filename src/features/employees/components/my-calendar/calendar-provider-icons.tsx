import React from 'react';

interface CalendarProviderIconProps {
  size?: number;
  className?: string;
}

export const GoogleCalendarIcon: React.FC<CalendarProviderIconProps> = ({
  size = 18,
  className = ''
}) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" fill="#fff" />
      <path
        d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2H3V7Z"
        fill="#4285F4"
      />
      <rect x="6" y="12" width="3.5" height="3.5" rx="0.5" fill="#EA4335" />
      <rect x="10.25" y="12" width="3.5" height="3.5" rx="0.5" fill="#FBBC04" />
      <rect x="14.5" y="12" width="3.5" height="3.5" rx="0.5" fill="#34A853" />
      <rect x="6" y="16.5" width="3.5" height="2.5" rx="0.5" fill="#4285F4" />
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="#DADCE0" strokeWidth="1" />
    </svg>
  );
};

export const OutlookCalendarIcon: React.FC<CalendarProviderIconProps> = ({
  size = 18,
  className = ''
}) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="10" height="15" rx="1.5" fill="#0F6CBD" />
      <path
        d="M9 3h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9V3Z"
        fill="#0078D4"
      />
      <rect x="11.5" y="7" width="8.5" height="9" rx="1" fill="#fff" fillOpacity="0.95" />
      <rect x="13" y="9" width="5.5" height="1.25" rx="0.5" fill="#0078D4" />
      <rect x="13" y="11.25" width="4" height="1.25" rx="0.5" fill="#50A0DC" />
      <rect x="13" y="13.5" width="5" height="1.25" rx="0.5" fill="#50A0DC" />
      <rect x="5" y="8" width="5" height="1.25" rx="0.5" fill="#fff" fillOpacity="0.9" />
      <rect x="5" y="10.5" width="4" height="1.25" rx="0.5" fill="#fff" fillOpacity="0.75" />
      <rect x="5" y="13" width="5" height="1.25" rx="0.5" fill="#fff" fillOpacity="0.75" />
    </svg>
  );
};
