export const convert = (value: number, currency: string, rate = 83) => {
  if (currency === 'USD') return value / rate;
  return value; // INR unchanged
};

export const inrToUsd = (value: number, rate = 83) => {
  return value / rate;
};