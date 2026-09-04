const invoiceTemplateService = require('../services/invoiceTemplate.service');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedPaymentOptionNames = ['Bank Transfer', 'UPI', 'Wallet', 'Other'];

const validatePaymentOptions = (options) => {
  if (!options) return [];
  if (!Array.isArray(options)) {
    const error = new Error('Payment options must be an array');
    error.statusCode = 400;
    throw error;
  }

  return options.map((opt) => {
    if (!opt || typeof opt !== 'object') {
      const error = new Error('Invalid payment option element');
      error.statusCode = 400;
      throw error;
    }

    if (!opt.name || typeof opt.name !== 'string' || !allowedPaymentOptionNames.includes(opt.name.trim())) {
      const error = new Error('Payment option name must be one of "Bank Transfer", "UPI", "Wallet", or "Other"');
      error.statusCode = 400;
      throw error;
    }

    return {
      name: opt.name.trim(),
      enabled: Boolean(opt.enabled)
    };
  });
};

const createInvoiceTemplate = async (req, res, next) => {
  try {
    const {
      businessName,
      businessAddress,
      gstin,
      email,
      website,
      invoiceNumber,
      invoiceDate,
      terms,
      dueDate,
      placeOfSupply,
      clientName,
      billingAddress,
      clientGstin,
      items,
      amountWithheld,
      totalInWords,
      notes,
      paymentOptions,
      bankDetails,
      footerMessage
    } = req.body;

    if (!businessName || typeof businessName !== 'string' || !businessName.trim()) {
      return res.status(400).json({ success: false, message: 'Business name is required' });
    }

    if (!businessAddress || typeof businessAddress !== 'string' || !businessAddress.trim()) {
      return res.status(400).json({ success: false, message: 'Business address is required' });
    }

    if (!email || typeof email !== 'string' || !email.trim() || !emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Valid email address is required' });
    }

    if (!invoiceNumber || typeof invoiceNumber !== 'string' || !invoiceNumber.trim()) {
      return res.status(400).json({ success: false, message: 'Invoice number is required' });
    }

    if (!invoiceDate || isNaN(Date.parse(invoiceDate))) {
      return res.status(400).json({ success: false, message: 'Valid invoice date is required' });
    }

    if (!clientName || typeof clientName !== 'string' || !clientName.trim()) {
      return res.status(400).json({ success: false, message: 'Client name is required' });
    }

    if (!billingAddress || typeof billingAddress !== 'string' || !billingAddress.trim()) {
      return res.status(400).json({ success: false, message: 'Billing address is required' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one line item is required' });
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.description || typeof item.description !== 'string' || !item.description.trim()) {
        return res.status(400).json({ success: false, message: `Item ${i + 1} description is required` });
      }

      const qty = Number(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({ success: false, message: `Item ${i + 1} quantity must be greater than 0` });
      }

      const rate = Number(item.rate);
      if (isNaN(rate) || rate < 0) {
        return res.status(400).json({ success: false, message: `Item ${i + 1} rate cannot be negative` });
      }

      if (item.taxPercent !== undefined && item.taxPercent !== null) {
        const tax = Number(item.taxPercent);
        if (isNaN(tax) || tax < 0) {
          return res.status(400).json({ success: false, message: `Item ${i + 1} tax percent cannot be negative` });
        }
      }
    }

    if (dueDate !== undefined && dueDate !== null && String(dueDate).trim() !== '') {
      if (isNaN(Date.parse(dueDate))) {
        return res.status(400).json({ success: false, message: 'Valid due date is required' });
      }
    }

    let parsedAmountWithheld = 0;
    if (amountWithheld !== undefined && amountWithheld !== null && String(amountWithheld).trim() !== '') {
      parsedAmountWithheld = Number(String(amountWithheld).trim());
      if (isNaN(parsedAmountWithheld) || parsedAmountWithheld < 0) {
        return res.status(400).json({ success: false, message: 'Amount withheld cannot be negative' });
      }
    }

    const validatedPaymentOptions = validatePaymentOptions(paymentOptions);

    const parsedBankDetails = {};
    if (bankDetails && typeof bankDetails === 'object') {
      if (bankDetails.accountName) parsedBankDetails.accountName = String(bankDetails.accountName).trim();
      if (bankDetails.accountType) parsedBankDetails.accountType = String(bankDetails.accountType).trim();
      if (bankDetails.accountNumber) parsedBankDetails.accountNumber = String(bankDetails.accountNumber).trim();
      if (bankDetails.ifscCode) parsedBankDetails.ifscCode = String(bankDetails.ifscCode).trim();
      if (bankDetails.bankName) parsedBankDetails.bankName = String(bankDetails.bankName).trim();
      if (bankDetails.branch) parsedBankDetails.branch = String(bankDetails.branch).trim();
    }

    const invoiceData = {
      businessName: businessName.trim(),
      businessAddress: businessAddress.trim(),
      gstin: gstin ? gstin.trim() : '',
      email: email.trim().toLowerCase(),
      website: website ? website.trim() : '',
      invoiceNumber: invoiceNumber.trim(),
      invoiceDate: new Date(invoiceDate),
      terms: terms ? terms.trim() : '',
      dueDate: dueDate ? new Date(dueDate) : null,
      placeOfSupply: placeOfSupply ? placeOfSupply.trim() : '',
      clientName: clientName.trim(),
      billingAddress: billingAddress.trim(),
      clientGstin: clientGstin ? clientGstin.trim() : '',
      items,
      amountWithheld: parsedAmountWithheld,
      totalInWords: totalInWords ? totalInWords.trim() : '',
      notes: notes ? notes.trim() : '',
      paymentOptions: validatedPaymentOptions,
      bankDetails: parsedBankDetails,
      footerMessage: footerMessage ? footerMessage.trim() : ''
    };

    const invoiceTemplate = await invoiceTemplateService.createInvoiceTemplate(invoiceData);

    res.status(201).json({
      success: true,
      message: 'Invoice template created successfully',
      data: {
        invoiceTemplate
      }
    });
  } catch (error) {
    next(error);
  }
};

const getInvoiceTemplates = async (req, res, next) => {
  try {
    const invoiceTemplates = await invoiceTemplateService.getInvoiceTemplates();

    res.status(200).json({
      success: true,
      data: {
        invoiceTemplates
      }
    });
  } catch (error) {
    next(error);
  }
};

const getInvoiceTemplate = async (req, res, next) => {
  try {
    const invoiceTemplate = await invoiceTemplateService.getInvoiceTemplateById(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        invoiceTemplate
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateInvoiceTemplate = async (req, res, next) => {
  try {
    const {
      businessName,
      businessAddress,
      gstin,
      email,
      website,
      invoiceNumber,
      invoiceDate,
      terms,
      dueDate,
      placeOfSupply,
      clientName,
      billingAddress,
      clientGstin,
      items,
      amountWithheld,
      totalInWords,
      notes,
      paymentOptions,
      bankDetails,
      footerMessage
    } = req.body;

    const updateData = {};

    if (businessName !== undefined) {
      if (typeof businessName !== 'string' || !businessName.trim()) {
        return res.status(400).json({ success: false, message: 'Business name cannot be empty' });
      }
      updateData.businessName = businessName.trim();
    }

    if (businessAddress !== undefined) {
      if (typeof businessAddress !== 'string' || !businessAddress.trim()) {
        return res.status(400).json({ success: false, message: 'Business address cannot be empty' });
      }
      updateData.businessAddress = businessAddress.trim();
    }

    if (gstin !== undefined) updateData.gstin = String(gstin).trim();

    if (email !== undefined) {
      if (typeof email !== 'string' || !email.trim() || !emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Valid email address is required' });
      }
      updateData.email = email.trim().toLowerCase();
    }

    if (website !== undefined) updateData.website = String(website).trim();

    if (invoiceNumber !== undefined) {
      if (typeof invoiceNumber !== 'string' || !invoiceNumber.trim()) {
        return res.status(400).json({ success: false, message: 'Invoice number cannot be empty' });
      }
      updateData.invoiceNumber = invoiceNumber.trim();
    }

    if (invoiceDate !== undefined) {
      if (isNaN(Date.parse(invoiceDate))) {
        return res.status(400).json({ success: false, message: 'Valid invoice date is required' });
      }
      updateData.invoiceDate = new Date(invoiceDate);
    }

    if (terms !== undefined) updateData.terms = String(terms).trim();

    if (dueDate !== undefined) {
      if (dueDate !== null && String(dueDate).trim() !== '' && isNaN(Date.parse(dueDate))) {
        return res.status(400).json({ success: false, message: 'Valid due date is required' });
      }
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }

    if (placeOfSupply !== undefined) updateData.placeOfSupply = String(placeOfSupply).trim();

    if (clientName !== undefined) {
      if (typeof clientName !== 'string' || !clientName.trim()) {
        return res.status(400).json({ success: false, message: 'Client name cannot be empty' });
      }
      updateData.clientName = clientName.trim();
    }

    if (billingAddress !== undefined) {
      if (typeof billingAddress !== 'string' || !billingAddress.trim()) {
        return res.status(400).json({ success: false, message: 'Billing address cannot be empty' });
      }
      updateData.billingAddress = billingAddress.trim();
    }

    if (clientGstin !== undefined) updateData.clientGstin = String(clientGstin).trim();

    if (items !== undefined) {
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one line item is required' });
      }

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.description || typeof item.description !== 'string' || !item.description.trim()) {
          return res.status(400).json({ success: false, message: `Item ${i + 1} description is required` });
        }

        const qty = Number(item.quantity);
        if (isNaN(qty) || qty <= 0) {
          return res.status(400).json({ success: false, message: `Item ${i + 1} quantity must be greater than 0` });
        }

        const rate = Number(item.rate);
        if (isNaN(rate) || rate < 0) {
          return res.status(400).json({ success: false, message: `Item ${i + 1} rate cannot be negative` });
        }

        if (item.taxPercent !== undefined && item.taxPercent !== null) {
          const tax = Number(item.taxPercent);
          if (isNaN(tax) || tax < 0) {
            return res.status(400).json({ success: false, message: `Item ${i + 1} tax percent cannot be negative` });
          }
        }
      }

      updateData.items = items;
    }

    if (amountWithheld !== undefined) {
      const parsedAmount = Number(String(amountWithheld).trim());
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        return res.status(400).json({ success: false, message: 'Amount withheld cannot be negative' });
      }
      updateData.amountWithheld = parsedAmount;
    }

    if (totalInWords !== undefined) updateData.totalInWords = String(totalInWords).trim();
    if (notes !== undefined) updateData.notes = String(notes).trim();

    if (paymentOptions !== undefined) {
      updateData.paymentOptions = validatePaymentOptions(paymentOptions);
    }

    if (bankDetails !== undefined) {
      const parsedBankDetails = {};
      if (bankDetails && typeof bankDetails === 'object') {
        if (bankDetails.accountName !== undefined) parsedBankDetails.accountName = String(bankDetails.accountName).trim();
        if (bankDetails.accountType !== undefined) parsedBankDetails.accountType = String(bankDetails.accountType).trim();
        if (bankDetails.accountNumber !== undefined) parsedBankDetails.accountNumber = String(bankDetails.accountNumber).trim();
        if (bankDetails.ifscCode !== undefined) parsedBankDetails.ifscCode = String(bankDetails.ifscCode).trim();
        if (bankDetails.bankName !== undefined) parsedBankDetails.bankName = String(bankDetails.bankName).trim();
        if (bankDetails.branch !== undefined) parsedBankDetails.branch = String(bankDetails.branch).trim();
      }
      updateData.bankDetails = parsedBankDetails;
    }

    if (footerMessage !== undefined) updateData.footerMessage = String(footerMessage).trim();

    const invoiceTemplate = await invoiceTemplateService.updateInvoiceTemplate(
      req.params.id,
      updateData
    );

    res.status(200).json({
      success: true,
      message: 'Invoice template updated successfully',
      data: {
        invoiceTemplate
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteInvoiceTemplate = async (req, res, next) => {
  try {
    await invoiceTemplateService.deleteInvoiceTemplate(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Invoice template deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const downloadInvoicePDF = async (req, res, next) => {
  try {
    await invoiceTemplateService.streamInvoicePDF(req.params.id, res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInvoiceTemplate,
  getInvoiceTemplates,
  getInvoiceTemplate,
  updateInvoiceTemplate,
  deleteInvoiceTemplate,
  downloadInvoicePDF
};
