export function formatShortDate(dateValue) {
  if (!dateValue) {
    return 'TBA';
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return 'TBA';
  }

  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return 'Dates TBA';
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Dates TBA';
  }

  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  if (sameMonth) {
    const month = start.toLocaleDateString(undefined, { month: 'short' });
    return `${month} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`;
  }

  if (sameYear) {
    const startPart = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const endPart = end.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${startPart} – ${endPart}`;
  }

  return `${formatShortDate(start)} – ${formatShortDate(end)}`;
}

export function toDateInputValue(dateValue) {
  if (!dateValue) {
    return '';
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDeadlineSummary(deadlineDate) {
  if (!deadlineDate) {
    return 'Deadline TBA';
  }

  const parsed = new Date(deadlineDate);
  if (Number.isNaN(parsed.getTime())) {
    return 'Deadline TBA';
  }

  const diffMs = parsed.getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'Registration closed';
  }
  if (diffDays === 0) {
    return 'Closes today';
  }
  if (diffDays === 1) {
    return '1 day left';
  }
  if (diffDays <= 14) {
    return `${diffDays} days left`;
  }

  return `By ${formatShortDate(parsed)}`;
}

export function getCategoryTheme(categories = []) {
  const primary = (categories[0] || '').toLowerCase();

  if (primary.includes('artificial') || primary.includes('machine')) {
    return 'ai';
  }
  if (primary.includes('web')) {
    return 'web';
  }
  if (primary.includes('fintech')) {
    return 'fintech';
  }
  if (primary.includes('cyber')) {
    return 'cyber';
  }
  if (primary.includes('iot')) {
    return 'iot';
  }
  if (primary.includes('sustain')) {
    return 'sustainability';
  }

  return 'innovation';
}
