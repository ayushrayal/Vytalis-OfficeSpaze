import api from '../../../services/api';

const extractDataArray = (result, key) => {
  if (result.status !== 'fulfilled' || !result.value?.data) return [];
  const body = result.value.data;
  if (!body.success) return [];
  
  if (Array.isArray(body.data)) {
    return body.data;
  }
  if (body.data && typeof body.data === 'object') {
    if (Array.isArray(body.data[key])) {
      return body.data[key];
    }
    // Fallback: check any array property in data
    const arrayProp = Object.values(body.data).find((val) => Array.isArray(val));
    if (arrayProp) return arrayProp;
  }
  return [];
};

export const dashboardService = {
  async fetchDashboardSummary() {
    const results = await Promise.allSettled([
      api.get('/walkins'),
      api.get('/virtual-offices'),
      api.get('/managed-offices'),
      api.get('/utility-bills'),
      api.get('/utility-bills/due'),
      api.get('/salaries'),
      api.get('/operation-bills'),
      api.get('/cowork-spaces'),
      api.get('/dedicated-spaces'),
      api.get('/invoice-templates')
    ]);

    const [
      walkInsRes,
      virtualOfficesRes,
      managedOfficesRes,
      utilityBillsRes,
      utilityBillsDueRes,
      salariesRes,
      operationBillsRes,
      coworkSpacesRes,
      dedicatedSpacesRes,
      invoiceTemplatesRes
    ] = results;

    const walkIns = extractDataArray(walkInsRes, 'walkIns');
    const virtualOffices = extractDataArray(virtualOfficesRes, 'virtualOffices');
    const managedOffices = extractDataArray(managedOfficesRes, 'managedOffices');
    const utilityBills = extractDataArray(utilityBillsRes, 'utilityBills');

    // Special handling for utility-bills/due which includes count and utilityBills array
    let dueUtilityBills = [];
    if (utilityBillsDueRes.status === 'fulfilled' && utilityBillsDueRes.value?.data?.success) {
      const dataObj = utilityBillsDueRes.value.data.data;
      if (Array.isArray(dataObj?.utilityBills)) {
        dueUtilityBills = dataObj.utilityBills;
      } else if (Array.isArray(dataObj)) {
        dueUtilityBills = dataObj;
      }
    }

    const salaries = extractDataArray(salariesRes, 'salaries');
    const operationBills = extractDataArray(operationBillsRes, 'operationBills');
    const coworkSpaces = extractDataArray(coworkSpacesRes, 'coworkSpaces');
    const dedicatedSpaces = extractDataArray(dedicatedSpacesRes, 'dedicatedSpaces');
    const invoiceTemplates = extractDataArray(invoiceTemplatesRes, 'invoiceTemplates');

    return {
      walkIns,
      virtualOffices,
      managedOffices,
      utilityBills,
      dueUtilityBills,
      salaries,
      operationBills,
      coworkSpaces,
      dedicatedSpaces,
      invoiceTemplates
    };
  }
};
