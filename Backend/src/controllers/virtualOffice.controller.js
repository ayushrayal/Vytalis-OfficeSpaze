const virtualOfficeService = require('../services/virtualOffice.service');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createVirtualOffice = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      email,
      companyName,
      companyRegisteredAddress,
      allottedVirtualAddress,
      allottedBy,
      startDate,
      endDate,
      agreedCommercials,
      paymentMadeOn
    } = req.body;

    // String field validations
    if (!firstName || typeof firstName !== 'string' || !firstName.trim()) {
      return res.status(400).json({ success: false, message: 'First name is required' });
    }

    if (!lastName || typeof lastName !== 'string' || !lastName.trim()) {
      return res.status(400).json({ success: false, message: 'Last name is required' });
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    if (!email || typeof email !== 'string' || !email.trim() || !emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Valid email address is required' });
    }

    if (!companyName || typeof companyName !== 'string' || !companyName.trim()) {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }

    if (!companyRegisteredAddress || typeof companyRegisteredAddress !== 'string' || !companyRegisteredAddress.trim()) {
      return res.status(400).json({ success: false, message: 'Company registered address is required' });
    }

    if (!allottedVirtualAddress || typeof allottedVirtualAddress !== 'string' || !allottedVirtualAddress.trim()) {
      return res.status(400).json({ success: false, message: 'Allotted virtual address is required' });
    }

    if (!allottedBy || typeof allottedBy !== 'string' || !allottedBy.trim()) {
      return res.status(400).json({ success: false, message: 'Allotted by is required' });
    }

    // Date validations
    if (!startDate || isNaN(Date.parse(startDate))) {
      return res.status(400).json({ success: false, message: 'Valid start date is required' });
    }

    if (!endDate || isNaN(Date.parse(endDate))) {
      return res.status(400).json({ success: false, message: 'Valid end date is required' });
    }

    if (!paymentMadeOn || isNaN(Date.parse(paymentMadeOn))) {
      return res.status(400).json({ success: false, message: 'Valid payment made date is required' });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    const parsedPaymentDate = new Date(paymentMadeOn);

    if (parsedEndDate < parsedStartDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be greater than or equal to start date'
      });
    }

    // Agreed Commercials validation (> 0)
    if (agreedCommercials === undefined || agreedCommercials === null || String(agreedCommercials).trim() === '') {
      return res.status(400).json({ success: false, message: 'Agreed commercials is required' });
    }

    const amount = Number(String(agreedCommercials).trim());
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Agreed commercials must be a positive number greater than 0'
      });
    }

    const virtualOfficeData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      companyName: companyName.trim(),
      companyRegisteredAddress: companyRegisteredAddress.trim(),
      allottedVirtualAddress: allottedVirtualAddress.trim(),
      allottedBy: allottedBy.trim(),
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      agreedCommercials: amount,
      paymentMadeOn: parsedPaymentDate
    };

    const virtualOffice = await virtualOfficeService.createVirtualOffice(virtualOfficeData, req.file);

    res.status(201).json({
      success: true,
      message: 'Virtual office created successfully',
      data: {
        virtualOffice
      }
    });
  } catch (error) {
    next(error);
  }
};

const getVirtualOffices = async (req, res, next) => {
  try {
    const virtualOffices = await virtualOfficeService.getVirtualOffices();

    res.status(200).json({
      success: true,
      data: {
        virtualOffices
      }
    });
  } catch (error) {
    next(error);
  }
};

const getVirtualOffice = async (req, res, next) => {
  try {
    const virtualOffice = await virtualOfficeService.getVirtualOfficeById(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        virtualOffice
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateVirtualOffice = async (req, res, next) => {
  try {
    const existingOffice = await virtualOfficeService.getVirtualOfficeById(req.params.id);

    const updateData = {};
    const {
      firstName,
      lastName,
      phone,
      email,
      companyName,
      companyRegisteredAddress,
      allottedVirtualAddress,
      allottedBy,
      startDate,
      endDate,
      agreedCommercials,
      paymentMadeOn
    } = req.body;

    if (firstName !== undefined) {
      if (typeof firstName !== 'string' || !firstName.trim()) {
        return res.status(400).json({ success: false, message: 'First name cannot be empty' });
      }
      updateData.firstName = firstName.trim();
    }

    if (lastName !== undefined) {
      if (typeof lastName !== 'string' || !lastName.trim()) {
        return res.status(400).json({ success: false, message: 'Last name cannot be empty' });
      }
      updateData.lastName = lastName.trim();
    }

    if (phone !== undefined) {
      if (typeof phone !== 'string' || !phone.trim()) {
        return res.status(400).json({ success: false, message: 'Phone number cannot be empty' });
      }
      updateData.phone = phone.trim();
    }

    if (email !== undefined) {
      if (typeof email !== 'string' || !email.trim() || !emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Valid email address is required' });
      }
      updateData.email = email.trim().toLowerCase();
    }

    if (companyName !== undefined) {
      if (typeof companyName !== 'string' || !companyName.trim()) {
        return res.status(400).json({ success: false, message: 'Company name cannot be empty' });
      }
      updateData.companyName = companyName.trim();
    }

    if (companyRegisteredAddress !== undefined) {
      if (typeof companyRegisteredAddress !== 'string' || !companyRegisteredAddress.trim()) {
        return res.status(400).json({ success: false, message: 'Company registered address cannot be empty' });
      }
      updateData.companyRegisteredAddress = companyRegisteredAddress.trim();
    }

    if (allottedVirtualAddress !== undefined) {
      if (typeof allottedVirtualAddress !== 'string' || !allottedVirtualAddress.trim()) {
        return res.status(400).json({ success: false, message: 'Allotted virtual address cannot be empty' });
      }
      updateData.allottedVirtualAddress = allottedVirtualAddress.trim();
    }

    if (allottedBy !== undefined) {
      if (typeof allottedBy !== 'string' || !allottedBy.trim()) {
        return res.status(400).json({ success: false, message: 'Allotted by cannot be empty' });
      }
      updateData.allottedBy = allottedBy.trim();
    }

    // Blend dates for partial update validation
    let effectiveStartDate = existingOffice.startDate;
    let effectiveEndDate = existingOffice.endDate;

    if (startDate !== undefined) {
      if (isNaN(Date.parse(startDate))) {
        return res.status(400).json({ success: false, message: 'Valid start date is required' });
      }
      effectiveStartDate = new Date(startDate);
      updateData.startDate = effectiveStartDate;
    }

    if (endDate !== undefined) {
      if (isNaN(Date.parse(endDate))) {
        return res.status(400).json({ success: false, message: 'Valid end date is required' });
      }
      effectiveEndDate = new Date(endDate);
      updateData.endDate = effectiveEndDate;
    }

    if (effectiveEndDate < effectiveStartDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be greater than or equal to start date'
      });
    }

    if (paymentMadeOn !== undefined) {
      if (isNaN(Date.parse(paymentMadeOn))) {
        return res.status(400).json({ success: false, message: 'Valid payment made date is required' });
      }
      updateData.paymentMadeOn = new Date(paymentMadeOn);
    }

    if (agreedCommercials !== undefined) {
      const amount = Number(String(agreedCommercials).trim());
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Agreed commercials must be a positive number greater than 0'
        });
      }
      updateData.agreedCommercials = amount;
    }

    const virtualOffice = await virtualOfficeService.updateVirtualOffice(
      req.params.id,
      updateData,
      req.file
    );

    res.status(200).json({
      success: true,
      message: 'Virtual office updated successfully',
      data: {
        virtualOffice
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteVirtualOffice = async (req, res, next) => {
  try {
    await virtualOfficeService.deleteVirtualOffice(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Virtual office deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVirtualOffice,
  getVirtualOffices,
  getVirtualOffice,
  updateVirtualOffice,
  deleteVirtualOffice
};
