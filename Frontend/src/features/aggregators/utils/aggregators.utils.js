export const filterAggregators = (aggregators = [], { search = '' }) => {
  const query = search.trim().toLowerCase();
  if (!query) return aggregators;

  return aggregators.filter((agg) => {
    const name = (agg.name || '').toLowerCase();
    const phone = (agg.phone || '').toLowerCase();
    const email = (agg.email || '').toLowerCase();
    const notes = (agg.notes || '').toLowerCase();

    return (
      name.includes(query) ||
      phone.includes(query) ||
      email.includes(query) ||
      notes.includes(query)
    );
  });
};
