/**
 * Utility class for handling date parsing, formatting, comparisons, and calculations.
 */
class DateHandler {
  constructor() {}

  /**
   * Returns a short string representation of the day of the week.
   *
   * @param {string} dateString - A date string parsable by the Date constructor.
   * @returns {string} - Two-letter day abbreviation (e.g., "M", "Tu", "W", etc.).
   * @throws {Error} - Throws if the input date string is invalid.
   */
  getDayOfWeek(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) {
      throw new Error("Invalid date format");
    }

    const days = ["Su", "M", "T", "W", "Th", "F", "S"];
    return days[date.getDay()];
  }

  /**
   * Converts a date string from one format to another.
   *
   * Supported tokens:
   * - `YYYY`: 4-digit year
   * - `YY`: 2-digit year
   * - `MM`: 2-digit month (01-12)
   * - `DD`: 2-digit day (01-31)
   * - `HH`: hours (00-23)
   * - `mm`: minutes (00-59)
   * - `ss`: seconds (00-59)
   *
   * @param {string} dateStr - The input date string.
   * @param {string} inputFormat - Format of the input string using tokens above.
   * @param {string} outputFormat - Desired output format using same tokens.
   * @returns {string} - The reformatted date string.
   * @throws {Error} - If the input string does not match the input format.
   */
  convertDateFormat(dateStr, inputFormat, outputFormat) {
    const formatMap = {
      DD: "(\\d{2})", // 01-31
      MM: "(\\d{2})", // 01-12
      YYYY: "(\\d{4})", // 4-digit year
      YY: "(\\d{2})", // 2-digit year
      HH: "(\\d{2})", // 00-23
      mm: "(\\d{2})", // 00-59
      ss: "(\\d{2})", // 00-59
    };

    // Escape separators
    let regexPattern = inputFormat
      .replace(/(DD|MM|YYYY|YY|HH|mm|ss)/g, (match) => formatMap[match])
      .replace(/[-/.]/g, "\\$&");

    const regex = new RegExp(`^${regexPattern}$`);
    const match = dateStr.match(regex);

    if (!match) {
      throw new Error(
        `Date string doesn't match the input format: Expected ${inputFormat}, got '${dateStr}'`
      );
    }

    // Extract values dynamically based on format
    let i = 1; // match[0] is full match, so start at index 1
    const values = {};
    inputFormat.match(/(DD|MM|YYYY|YY|HH|mm|ss)/g).forEach((key) => {
      values[key] = match[i++];
    });

    // Replace output format tokens with extracted values
    return outputFormat.replace(
      /(DD|MM|YYYY|YY|HH|mm|ss)/g,
      (match) => values[match]
    );
  }

  /**
   * Checks if a date is between two other dates (inclusive).
   *
   * @param {Date|string} date1 - The first boundary date.
   * @param {Date|string} date2 - The second boundary date.
   * @param {Date|string} dateToCheck - The date to test.
   * @returns {boolean} - True if dateToCheck is within or equal to the range, false otherwise.
   */
  isDateBetween(date1, date2, dateToCheck) {
    const start = this.toDateOnly(date1);
    const end = this.toDateOnly(date2);
    const checkDate = this.toDateOnly(dateToCheck);

    // Ensure start is the earlier date and end is the later date
    const [earliest, latest] = start < end ? [start, end] : [end, start];

    // Check if checkDate is between earliest and latest, inclusive
    return checkDate >= earliest && checkDate <= latest;
  }

  /**
   * Strips the time from a Date object or string, returning a date at 00:00:00.
   *
   * @param {Date|string} date - The date to normalize.
   * @returns {Date} - A Date object representing only the date portion.
   */
  toDateOnly = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  /**
   * Calculates the difference in minutes between two times in HH:MM format.
   *
   * @param {string} startTime - Start time in "HH:MM" format.
   * @param {string} endTime - End time in "HH:MM" format.
   * @returns {number} - The time difference in minutes.
   */
  timeDifferenceMins(startTime, endTime) {
    // Convert HH:MM to minutes past midnight
    function toMinutes(time) {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    }

    const startMinutes = toMinutes(startTime);
    let endMinutes = toMinutes(endTime);

    // Handle cases where endTime crosses midnight
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60; // Add 24 hours in minutes
    }

    return endMinutes - startMinutes;
  }
}

export default new DateHandler();
