export const convertCurrency = (value: number, currency: string, rate: number = 83) => {
  if (currency === "USD") return value / rate;
  return value; // INR → leave original
};

export const formatCurrency = (value: number, currency: string) => {
  if (currency === "USD") return `$ ${value.toLocaleString()}`;
  return `₹ ${value.toLocaleString()}`;
};
