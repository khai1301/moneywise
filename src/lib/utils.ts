export function formatCurrency(amount: number, short = false) {
  if (short && amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1).replace(/\.0$/, '')}M ₫`;
  }
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}
