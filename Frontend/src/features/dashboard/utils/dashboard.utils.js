export const formatINR = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

export const formatDashboardDate = (dateVal) => {
  if (!dateVal) return '-';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const isRecordActive = (record) => {
  if (!record || !record.startDate || !record.endDate) return false;
  const start = new Date(record.startDate);
  const end = new Date(record.endDate);
  const now = new Date();

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;

  // Set time boundaries for inclusive comparison
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return now >= start && now <= end;
};

export const countActiveRecords = (records = []) => {
  if (!Array.isArray(records)) return 0;
  return records.filter(isRecordActive).length;
};

export const calculateTotalSeats = (...spaceArrays) => {
  let total = 0;
  spaceArrays.forEach((arr) => {
    if (Array.isArray(arr)) {
      arr.forEach((item) => {
        const seats = Number(item?.totalSeats);
        if (!isNaN(seats) && seats > 0) {
          total += seats;
        }
      });
    }
  });
  return total;
};

export const calculateSumByField = (records = [], fieldName) => {
  if (!Array.isArray(records)) return 0;
  return records.reduce((sum, item) => {
    const val = Number(item?.[fieldName]);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
};

export const formatDashboardDateTime = (dateVal) => {
  if (!dateVal) return '-';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '-';
  const datePart = d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const timePart = d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  return `${datePart}, ${timePart}`;
};

