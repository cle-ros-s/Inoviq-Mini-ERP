export function formatCurrency(amount, symbol = '₹') {
  if (amount == null || isNaN(amount)) return `${symbol} 0.00`;
  return `${symbol} ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diffInMs = new Date(dateStr) - new Date();
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.round(diffInMs / (1000 * 60));

  if (Math.abs(diffInDays) > 0) return rtf.format(diffInDays, 'day');
  if (Math.abs(diffInHours) > 0) return rtf.format(diffInHours, 'hour');
  if (Math.abs(diffInMinutes) > 0) return rtf.format(diffInMinutes, 'minute');
  return 'just now';
}

export function formatId(id) {
  if (!id) return '';
  return id.toUpperCase();
}

export function formatQuantity(qty, unit = '') {
  if (qty == null || isNaN(qty)) return `0 ${unit}`.trim();
  return `${Number(qty).toLocaleString('en-IN')} ${unit}`.trim();
}
