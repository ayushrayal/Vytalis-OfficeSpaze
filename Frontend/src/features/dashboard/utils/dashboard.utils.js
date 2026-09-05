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

export const combineRecentActivities = ({
  walkIns = [],
  virtualOffices = [],
  managedOffices = [],
  coworkSpaces = [],
  dedicatedSpaces = [],
  invoiceTemplates = []
}) => {
  const activities = [];

  walkIns.forEach((item) => {
    const name = item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Walk-in visitor';
    activities.push({
      id: item._id || item.id,
      module: 'Walk-in',
      title: `Walk-in registered: ${name}`,
      subtitle: item.source ? `Source: ${item.source}` : 'Visitor log',
      date: item.date || item.createdAt,
      type: 'walkin'
    });
  });

  virtualOffices.forEach((item) => {
    const name = item.companyName || `${item.firstName || ''} ${item.lastName || ''}`.trim();
    activities.push({
      id: item._id || item.id,
      module: 'Virtual Office',
      title: `Virtual Office: ${name}`,
      subtitle: item.agreedCommercials ? `Commercials: ${formatINR(item.agreedCommercials)}` : 'Client',
      date: item.createdAt || item.startDate,
      type: 'virtual-office'
    });
  });

  managedOffices.forEach((item) => {
    const name = item.companyName || `${item.firstName || ''} ${item.lastName || ''}`.trim();
    activities.push({
      id: item._id || item.id,
      module: 'Managed Office',
      title: `Managed Office: ${name}`,
      subtitle: `${item.totalSeats || 0} seats allotted`,
      date: item.createdAt || item.startDate,
      type: 'managed-office'
    });
  });

  coworkSpaces.forEach((item) => {
    const name = `${item.firstName || ''} ${item.lastName || ''}`.trim();
    activities.push({
      id: item._id || item.id,
      module: 'Cowork Space',
      title: `Cowork Space booking: ${name}`,
      subtitle: `${item.totalSeats || 0} seats • ${item.businessType || 'Booking'}`,
      date: item.addedDate || item.createdAt,
      type: 'cowork-space'
    });
  });

  dedicatedSpaces.forEach((item) => {
    const name = `${item.firstName || ''} ${item.lastName || ''}`.trim();
    activities.push({
      id: item._id || item.id,
      module: 'Dedicated Space',
      title: `Dedicated Space booking: ${name}`,
      subtitle: `${item.totalSeats || 0} seats • ${item.businessType || 'Booking'}`,
      date: item.addedDate || item.createdAt,
      type: 'dedicated-space'
    });
  });

  invoiceTemplates.forEach((item) => {
    activities.push({
      id: item._id || item.id,
      module: 'Invoice',
      title: `Invoice created: ${item.invoiceNumber || 'Template'}`,
      subtitle: item.clientName ? `Client: ${item.clientName}` : 'Template',
      date: item.createdAt || item.invoiceDate,
      type: 'invoice'
    });
  });

  return activities
    .filter((a) => a.date && !isNaN(new Date(a.date).getTime()))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 7);
};
