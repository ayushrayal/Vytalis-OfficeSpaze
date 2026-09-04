const mongoose = require('mongoose');
const InvoiceTemplate = require('../models/InvoiceTemplate');
const pdfGenerator = require('../utils/pdfGenerator.util');

const calculateInvoiceTotals = (data) => {
  if (Array.isArray(data.items)) {
    let calculatedSubTotal = 0;
    let calculatedTaxTotal = 0;

    data.items = data.items.map((item) => {
      const quantity = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      const taxPercent = Number(item.taxPercent) || 0;

      const itemBaseAmount = quantity * rate;
      const taxAmount = itemBaseAmount * (taxPercent / 100);
      const lineAmount = itemBaseAmount + taxAmount;

      calculatedSubTotal += itemBaseAmount;
      calculatedTaxTotal += taxAmount;

      return {
        description: item.description ? item.description.trim() : '',
        hsnSac: item.hsnSac ? item.hsnSac.trim() : '',
        quantity,
        rate,
        taxPercent,
        taxAmount: Math.round(taxAmount * 100) / 100,
        lineAmount: Math.round(lineAmount * 100) / 100
      };
    });

    data.subTotal = Math.round(calculatedSubTotal * 100) / 100;
    data.taxTotal = Math.round(calculatedTaxTotal * 100) / 100;
    data.total = Math.round((data.subTotal + data.taxTotal) * 100) / 100;

    const amountWithheld = Number(data.amountWithheld) || 0;
    data.amountWithheld = amountWithheld;
    data.balanceDue = Math.round((data.total - amountWithheld) * 100) / 100;
  }

  return data;
};

const createInvoiceTemplate = async (data) => {
  const processedData = calculateInvoiceTotals(data);
  const invoiceTemplate = await InvoiceTemplate.create(processedData);
  return invoiceTemplate;
};

const getInvoiceTemplates = async () => {
  const invoiceTemplates = await InvoiceTemplate.find().sort({ createdAt: -1 });
  return invoiceTemplates;
};

const getInvoiceTemplateById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invoice template not found');
    error.statusCode = 404;
    throw error;
  }

  const invoiceTemplate = await InvoiceTemplate.findById(id);
  if (!invoiceTemplate) {
    const error = new Error('Invoice template not found');
    error.statusCode = 404;
    throw error;
  }

  return invoiceTemplate;
};

const updateInvoiceTemplate = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invoice template not found');
    error.statusCode = 404;
    throw error;
  }

  const existingTemplate = await InvoiceTemplate.findById(id);
  if (!existingTemplate) {
    const error = new Error('Invoice template not found');
    error.statusCode = 404;
    throw error;
  }

  // If items or amountWithheld are being updated, merge with existing and recalculate
  if (updateData.items || updateData.amountWithheld !== undefined) {
    const mergedData = {
      items: updateData.items || existingTemplate.items,
      amountWithheld: updateData.amountWithheld !== undefined ? updateData.amountWithheld : existingTemplate.amountWithheld
    };
    const recalculated = calculateInvoiceTotals(mergedData);
    updateData.items = recalculated.items;
    updateData.subTotal = recalculated.subTotal;
    updateData.taxTotal = recalculated.taxTotal;
    updateData.total = recalculated.total;
    updateData.amountWithheld = recalculated.amountWithheld;
    updateData.balanceDue = recalculated.balanceDue;
  }

  const updatedTemplate = await InvoiceTemplate.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });

  return updatedTemplate;
};

const deleteInvoiceTemplate = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invoice template not found');
    error.statusCode = 404;
    throw error;
  }

  const invoiceTemplate = await InvoiceTemplate.findByIdAndDelete(id);
  if (!invoiceTemplate) {
    const error = new Error('Invoice template not found');
    error.statusCode = 404;
    throw error;
  }

  return true;
};

const streamInvoicePDF = async (id, res) => {
  const invoice = await getInvoiceTemplateById(id);
  pdfGenerator.generateInvoicePDF(invoice, res);
};

module.exports = {
  createInvoiceTemplate,
  getInvoiceTemplates,
  getInvoiceTemplateById,
  updateInvoiceTemplate,
  deleteInvoiceTemplate,
  streamInvoicePDF
};
