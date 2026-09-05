export const formatCurrencyINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const calculateSummaryMetrics = (salaries = []) => {
  let totalRecords = salaries.length;
  let paidRecords = 0;
  let dueRecords = 0;
  let totalPayroll = 0;
  let paidPayroll = 0;
  let duePayroll = 0;

  salaries.forEach((item) => {
    const salary = Number(item.employeeSalary) || 0;
    totalPayroll += salary;

    if (item.status === 'Paid') {
      paidRecords += 1;
      paidPayroll += salary;
    } else if (item.status === 'Due') {
      dueRecords += 1;
      duePayroll += salary;
    }
  });

  return {
    totalRecords,
    paidRecords,
    dueRecords,
    totalPayroll,
    paidPayroll,
    duePayroll
  };
};

export const extractUniqueRoles = (salaries = []) => {
  const roles = salaries.map((item) => item.role).filter(Boolean);
  return Array.from(new Set(roles)).sort();
};

export const filterSalaries = (salaries = [], { search = '', status = 'All', role = 'All' }) => {
  const query = search.trim().toLowerCase();

  return salaries.filter((item) => {
    // Status Filter ('Paid' | 'Due')
    if (status !== 'All' && item.status !== status) {
      return false;
    }

    // Role Filter
    if (role !== 'All' && item.role !== role) {
      return false;
    }

    // Search Query Filter (employeeName, role, email, phone)
    if (query) {
      const name = (item.employeeName || '').toLowerCase();
      const itemRole = (item.role || '').toLowerCase();
      const email = (item.email || '').toLowerCase();
      const phone = (item.phone || '').toLowerCase();

      const matchesSearch =
        name.includes(query) ||
        itemRole.includes(query) ||
        email.includes(query) ||
        phone.includes(query);

      if (!matchesSearch) return false;
    }

    return true;
  });
};
