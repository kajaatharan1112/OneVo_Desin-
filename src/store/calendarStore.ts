import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { employeeCalendarData } from '../features/employees/data/employee-calendar.data';
import type { CalendarEvent, CalendarSyncStatus, SyncProvider } from '../features/employees/types/employee-calendar.types';

interface CalendarState {
  events: CalendarEvent[];
  syncStatus: CalendarSyncStatus;
  lastConnectedProvider: SyncProvider | null;

  addEvents: (events: CalendarEvent[]) => void;
  updateEvent: (id: string, updated: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
  setEvents: (events: CalendarEvent[]) => void;
  updateSeries: (seriesId: string, changes: Partial<CalendarEvent>) => void;
  deleteSeries: (seriesId: string) => void;
  setSyncStatus: (syncStatus: CalendarSyncStatus) => void;
  setLastConnectedProvider: (provider: SyncProvider | null) => void;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    set => ({
      events: employeeCalendarData.events,
      syncStatus: employeeCalendarData.syncStatus,
      lastConnectedProvider: employeeCalendarData.syncStatus.google === 'connected' ? 'google' : null,

      addEvents: events => set(state => ({ events: [...state.events, ...events] })),
      updateEvent: (id, updated) => set(state => ({
        events: state.events.map(e => (e.id === id ? updated : e))
      })),
      deleteEvent: id => set(state => ({ events: state.events.filter(e => e.id !== id) })),
      setEvents: events => set({ events }),
      updateSeries: (seriesId, changes) => set(state => ({
        events: state.events.map(e => (e.seriesId === seriesId ? { ...e, ...changes } : e))
      })),
      deleteSeries: seriesId => set(state => ({
        events: state.events.filter(e => e.seriesId !== seriesId)
      })),
      setSyncStatus: syncStatus => set({ syncStatus }),
      setLastConnectedProvider: provider => set({ lastConnectedProvider: provider })
    }),
    { name: 'onevo-calendar-store', version: 1 }
  )
);
