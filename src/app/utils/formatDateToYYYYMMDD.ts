const formatDateToYYYYMMDD = (isoDateString?: string | Date): string => {
  if (!isoDateString) {
    return '';
  }

  let date: Date;
  if (isoDateString instanceof Date) {
    date = isoDateString;
  } else {
    // Attempt to parse the string. Handle potential invalid date strings.
    try {
      date = new Date(isoDateString);
    } catch (e) {
      console.error("Invalid date string provided:", isoDateString, e);
      return ''; // Return empty string for invalid date strings
    }
  }

  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.error("Invalid date object after parsing:", isoDateString);
    return ''; // Return empty string for invalid date objects
  }

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export default formatDateToYYYYMMDD;
