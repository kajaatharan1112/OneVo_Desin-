import React from 'react';
import { CalendarClock, Cake, CheckCircle2, Video, MapPin, Users } from 'lucide-react';
import { executiveDashboard } from '../../../data/executive-dashboard.data';
import { todayMeetings } from '../../../data/tenant-today-productivity.data';
import type { TodayMeeting } from '../../../data/tenant-today-productivity.data';

const getIconForType = (meeting: TodayMeeting) => {
  let iconContent;
  if (meeting.type === 'birthday' || meeting.isEvent) iconContent = <Cake size={14} />;
  else if (meeting.type === 'task') iconContent = <CheckCircle2 size={14} />;
  else if (meeting.hasJoinLink || meeting.location?.includes('Teams')) {
    iconContent = <Video size={14} />;
  } else {
    iconContent = <MapPin size={14} />;
  }

  return (
    <span className="tto-status-icon" aria-hidden="true">
      {iconContent}
    </span>
  );
};

export const MeetingSchedulePanel: React.FC = () => {
  const { title, totalToday } = executiveDashboard.schedule;

  return (
    <article className="tto-widget tto-meetings tto-cell--meetings">
      <header className="tto-widget__head">
        <CalendarClock size={16} aria-hidden="true" />
        <h3 className="tto-widget__title">{title}</h3>
        <span className="tto-widget__tab">{totalToday} today</span>
      </header>
      <ul className="tto-meetings__list">
        {todayMeetings.map((meeting) => (
          <li key={meeting.id} className={`tto-meetings__item tto-meetings__item--${meeting.type || 'meeting'}`}>
            <div className="tto-meetings__time-col">
              <span className="tto-meetings__time">{meeting.time}</span>
              {getIconForType(meeting)}
            </div>

            <div className="tto-meetings__content">
              <div className="tto-meetings__header">
                <span className="tto-meetings__title">{meeting.title}</span>
                {meeting.hasJoinLink ? (
                  <button type="button" className="tto-meetings__join-btn">Join</button>
                ) : null}
              </div>

              <div className="tto-meetings__meta-row">
                <span className="tto-meetings__purpose">{meeting.context ?? meeting.purpose}</span>
              </div>

              {meeting.attendeesCount ? (
                <div className="tto-meetings__meta-row">
                  <span className="tto-meetings__detail-item">
                    <Users size={10} /> {meeting.attendeesCount} members
                  </span>
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
};
