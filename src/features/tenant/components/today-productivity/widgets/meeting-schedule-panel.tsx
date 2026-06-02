import React from 'react';
import { CalendarClock, Cake, CheckCircle2, Video, MapPin, User, Clock, Users } from 'lucide-react';
import { todayMeetings } from '../../../data/tenant-today-productivity.data';
import type { TodayMeeting } from '../../../data/tenant-today-productivity.data';

const getIconForType = (meeting: TodayMeeting) => {
  let iconContent;
  if (meeting.type === 'birthday') iconContent = <Cake size={14} />;
  else if (meeting.type === 'task') iconContent = <CheckCircle2 size={14} />;
  else if (meeting.location === 'Zoom' || meeting.location?.includes('Teams')) {
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
  return (
    <article className="tto-widget tto-meetings tto-cell--meetings">
      <header className="tto-widget__head">
        <CalendarClock size={16} aria-hidden="true" />
        <h3 className="tto-widget__title">Schedule</h3>
        <span className="tto-widget__tab">{todayMeetings.length} today</span>
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
                {meeting.type === 'meeting' && (meeting.location?.includes('Zoom') || meeting.location?.includes('Teams')) && (
                  <button type="button" className="tto-meetings__join-btn">Join</button>
                )}
              </div>
              
              <div className="tto-meetings__meta-row">
                {meeting.purpose && <span className="tto-meetings__purpose">{meeting.purpose}</span>}
                {meeting.purpose && meeting.location && <span className="tto-meetings__dot">·</span>}
                {meeting.location && <span className="tto-meetings__location-text">{meeting.location}</span>}
              </div>
              
              <div className="tto-meetings__meta-row">
                {meeting.scheduledBy && (
                  <span className="tto-meetings__detail-item">
                    <User size={10} /> {meeting.scheduledBy}
                  </span>
                )}
                {meeting.scheduledAt && (
                  <>
                    {meeting.scheduledBy && <span className="tto-meetings__dot">·</span>}
                    <span className="tto-meetings__detail-item">
                      <Clock size={10} /> {meeting.scheduledAt}
                    </span>
                  </>
                )}
                {meeting.members && meeting.members.length > 0 && (
                  <>
                    {(meeting.scheduledBy || meeting.scheduledAt) && <span className="tto-meetings__dot">·</span>}
                    <span className="tto-meetings__detail-item">
                      <Users size={10} /> {meeting.members.length} members
                    </span>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
};
