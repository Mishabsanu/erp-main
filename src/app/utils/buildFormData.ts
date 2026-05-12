export const buildFormData = (data: any): FormData => {
  const formData = new FormData();

  const appendValue = (key: string, value: any) => {
    if (value === undefined || value === null) {
      return;
    }
    if (value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((item) => appendValue(key, item)); // Recursively handle array items
    } else if (typeof value === 'object' && value !== null && !(value instanceof Date)) { // Handle plain objects
      // If it's an object but not a file or array, stringify it
      formData.append(key, JSON.stringify(value));
    }
     else {
      formData.append(key, String(value));
    }
  };

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      if (key === 'imagePreview' || key === 'imagesPreview') {
        continue; // Skip preview fields
      }

      const value = data[key];
      appendValue(key, value);
    }
  }

  return formData;
};
