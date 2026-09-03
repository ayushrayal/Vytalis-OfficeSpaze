const managedOfficeService = require('../services/managedOffice.service');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createManagedOffice = async (req, res, next) => {
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
      paymentMadeOn,
      officeNo,
      totalSeats,
      perSeatCost
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

    if (!officeNo || typeof officeNo !== 'string' || !officeNo.trim()) {
      return res.status(400).json({ success: false, message: 'Office number is required' });
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

    // Total Seats validation (positive integer)
    if (totalSeats === undefined || totalSeats === null || String(totalSeats).trim() === '') {
      return res.status(400).json({ success: false, message: 'Total seats is required' });
    }

    const seats = Number(String(totalSeats).trim());
    if (isNaN(seats) || !Number.isInteger(seats) || seats <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total seats must be a positive integer'
      });
    }

    // Per Seat Cost validation (> 0)
    if (perSeatCost === undefined || perSeatCost === null || String(perSeatCost).trim() === '') {
      return res.status(400).json({ success: false, message: 'Per seat cost is required' });
    }

    const seatCost = Number(String(perSeatCost).trim());
    if (isNaN(seatCost) || seatCost <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Per seat cost must be a positive number greater than 0'
      });
    }

    const managedOfficeData = {
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
      paymentMadeOn: parsedPaymentDate,
      officeNo: officeNo.trim(),
      totalSeats: seats,
      perSeatCost: seatCost
    };

    const managedOffice = await managedOfficeService.createManagedOffice(managedOfficeData, req.file);

    res.status(201).json({
      success: true,
      message: 'Managed office created successfully',
      data: {
        managedOffice
      }
    });
  } catch (error) {
    next(error);
  }
};

const getManagedOffices = async (req, res, next) => {
  try {
    const managedOffices = await managedOfficeService.getManagedOffices();

    res.status(200).json({
      success: true,
      data: {
        managedOffices
      }
    });
  } catch (error) {
    next(error);
  }
};

const getManagedOffice = async (req, res, next) => {
  try {
    const managedOffice = await managedOfficeService.getManagedOfficeById(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        managedOffice
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateManagedOffice = async (req, res, next) => {
  try {
    const existingOffice = await managedOfficeService.getManagedOfficeById(req.params.id);

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
      paymentMadeOn,
      officeNo,
      totalSeats,
      perSeatCost
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

    if (officeNo !== undefined) {
      if (typeof officeNo !== 'string' || !officeNo.trim()) {
        return res.status(400).json({ success: false, message: 'Office number cannot be empty' });
      }
      updateData.officeNo = officeNo.trim();
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

    if (totalSeats !== undefined) {
      const seats = Number(String(totalSeats).trim());
      if (isNaN(seats) || !Number.isInteger(seats) || seats <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Total seats must be a positive integer'
        });
      }
      updateData.totalSeats = seats;
    }

    if (perSeatCost !== undefined) {
      const seatCost = Number(String(perSeatCost).trim());
      if (isNaN(seatCost) || seatCost <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Per seat cost must be a positive number greater than 0'
        });
      }
      updateData.perSeatCost = seatCost;
    }

    const managedOffice = await managedOfficeService.updateManagedOffice(
      req.params.id,
      updateData,
      req.file
    );

    res.status(200).json({
      success: true,
      message: 'Managed office updated successfully',
      data: {
        managedOffice
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteManagedOffice = async (req, res, next) => {
  try {
    await managedOfficeService.deleteManagedOffice(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Managed office deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createManagedOffice,
  getManagedOffices,
  getManagedOffice,
  updateManagedOffice,
  deleteManagedOffice
};
