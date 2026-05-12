import { isSameDay, parseISO } from 'date-fns';

export interface Holiday {
    date: string; // YYYY-MM-DD
    name: string;
}

export const holidays: Holiday[] = [
  { date: '2025-01-01', name: 'New Year Day' },
  { date: '2025-01-14', name: 'Makar Sankranti' },
  { date: '2025-01-26', name: 'Republic Day' },

  { date: '2025-03-08', name: 'Maha Shivaratri' },
  { date: '2025-03-25', name: 'Holi' },
  { date: '2025-03-30', name: 'Ugadi' },

  { date: '2025-04-10', name: 'Id-ul-Fitr (Ramzan)' },
  { date: '2025-04-14', name: 'Vishu' },
  { date: '2025-04-18', name: 'Good Friday' },

  { date: '2025-05-01', name: 'May Day' },

  { date: '2025-06-07', name: 'Bakrid / Eid al-Adha' },

  { date: '2025-07-17', name: 'Karkidaka Vavu' },

  { date: '2025-08-15', name: 'Independence Day' },
  { date: '2025-08-28', name: 'Thiruvonam (Onam)' },
  { date: '2025-08-29', name: 'Uthradam (Onam)' },

  { date: '2025-09-05', name: 'Sree Narayana Guru Jayanti' },
  { date: '2025-09-16', name: 'Milad-un-Nabi' },

  { date: '2025-10-02', name: 'Gandhi Jayanti' },
  { date: '2025-10-20', name: 'Deepavali' },

  { date: '2025-11-01', name: 'Kerala Piravi' },
  { date: '2025-11-15', name: 'Sree Narayana Guru Samadhi' },

  { date: '2025-12-25', name: 'Christmas' }
];


export const getHoliday = (date: Date): Holiday | undefined => {
    return holidays.find(h => isSameDay(parseISO(h.date), date));
};
