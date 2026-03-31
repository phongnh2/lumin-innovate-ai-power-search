/* eslint-disable */
import date from '../date';

Date.now = jest.fn().mockImplementation(() => new Date(2018, 4, 11, 12, 12, 12));
const t = jest.fn().mockImplementation((key) => {
  switch (key) {
    case 'option.status.aFewSecondsAgo':
      return 'a few seconds ago';
    case 'option.status.minutesAgo':
      return 'minutes ago';
    case 'option.status.hoursAgo':
      return 'hours ago';
    case 'option.status.daysAgo':
      return 'days ago';
  }
});
describe('date function', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });
  it('format date', () => {
    const dateInput = new Date('11/02/2019');
    expect(date.formatDate(dateInput)).toBe('2 Nov, 2019');
  });

  it('format full date', () => {
    const dateInput = new Date('11/02/2019 2:19:00');
    expect(date.formatFullDate(dateInput)).toBe('Nov 2, 2019 2:19 AM');
  });

  describe('add days', () => {
    it('should be 3 days after', () => {
      const dateInput = new Date('11/02/2019');
      expect(date.addDays(dateInput, 3)).toStrictEqual(new Date('11/05/2019'));
    });

    it('should be 4 days after', () => {
      const dateInput = new Date('02/28/2019');
      expect(date.addDays(dateInput, 4)).toStrictEqual(new Date('03/04/2019'));
    });
  });

  describe('convert to relative time', () => {
    it('should be exact day', () => {
      expect(date.convertToRelativeTime(new Date('01/01/2018'), t)).toBe(
        date.formatDateAndMonth(new Date('01/01/2018'))
      );
    });

    it('should be few days ago', () => {
      const newDate = new Date(2018, 4, 9);
      expect(date.convertToRelativeTime(newDate, t)).toBe('3 days ago');
    });

    it('should be few hours ago', () => {
      const newDate = new Date(2018, 4, 11, 10);
      expect(date.convertToRelativeTime(newDate, t)).toBe('3 hours ago');
    });

    it('should be few minutes ago', () => {
      const newDate = new Date(2018, 4, 11, 12, 8);
      expect(date.convertToRelativeTime(newDate, t)).toBe(
        '5 minutes ago'
      );
    });

    it('should be few seconds ago', () => {
      const newDate = new Date(2018, 4, 11, 12, 12, 5);
      expect(date.convertToRelativeTime(newDate, t)).toBe(
        'a few seconds ago'
      );
    });
  });

  describe('formatFullTime', () => {
    it('should be format full time', () => {
      const dateInput = new Date('11/02/2019 2:19:00');
      expect(date.formatFullTime(dateInput)).not.toBeNull();
    });
  });

  describe('formatDeleteAccountTime', () => {
    it('should be format delete account time', () => {
      const dateInput = new Date('11/02/2019 2:19:00');
      expect(date.formatDeleteAccountTime(dateInput)).not.toBeNull();
    });
  });

  describe('formatHourMinute', () => {
    it('should be format hour minute', () => {
      const dateInput = new Date('11/02/2019 2:19:00');
      expect(date.formatHourMinute(dateInput)).not.toBeNull();
    });
  });

  describe('formatFullDateName', () => {
    it('should be format full date name', () => {
      const dateInput = new Date('11/02/2019 2:19:00');
      expect(date.formatFullDateName(dateInput)).not.toBeNull();
    });
  });

  describe('formatMDYTime', () => {
    it('should be format MDY time', () => {
      const dateInput = new Date('11/02/2019 2:19:00');
      expect(date.formatMDYTime(dateInput)).not.toBeNull();
    });
  });

  describe('getFormatDateStampByLanguage', () => {
    it('should be format date stamp by language', () => {
      const dateInput = new Date('11/02/2019 2:19:00');
      expect(date.getFormatDateStampByLanguage(dateInput)).not.toBeNull();
    });
  });
});
