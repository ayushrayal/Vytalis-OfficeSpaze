const coworkSpaceService = require('../services/coworkSpace.service');
const activityService = require('../services/activity.service');
const { broadcastDashboardUpdate } = require('../utils/dashboardBroadcaster.util');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createCoworkSpace = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      email,
      businessType,
      addedDate,
      totalSeats,
      seatPerCost,
      startDate,
      endDate,
      allottedBy,
      allocatedBy
    } = req.body;

    const allocatedPerson = (allottedBy || allocatedBy || '').trim();

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

    const allowedBusinessTypes = ['Register', 'Unregistered', 'Registor', 'Non Registor'];
    if (!businessType || !allowedBusinessTypes.includes(businessType)) {
      return res.status(400).json({
        success: false,
        message: 'Business type must be either "Register" or "Unregistered"'
      });
    }

    if (!addedDate || isNaN(Date.parse(addedDate))) {
      return res.status(400).json({ success: false, message: 'Valid added date is required' });
    }

    if (totalSeats === undefined || totalSeats === null || String(totalSeats).trim() === '') {
      return res.status(400).json({ success: false, message: 'Total seats is required' });
    }
    const seats = Number(String(totalSeats).trim());
    if (!Number.isInteger(seats) || seats <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total seats must be a positive integer greater than 0'
      });
    }

    if (seatPerCost === undefined || seatPerCost === null || String(seatPerCost).trim() === '') {
      return res.status(400).json({ success: false, message: 'Seat per cost is required' });
    }
    const cost = Number(String(seatPerCost).trim());
    if (isNaN(cost) || cost <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Seat per cost must be a positive number greater than 0'
      });
    }

    if (!startDate || isNaN(Date.parse(startDate))) {
      return res.status(400).json({ success: false, message: 'Valid start date is required' });
    }

    if (!endDate || isNaN(Date.parse(endDate))) {
      return res.status(400).json({ success: false, message: 'Valid end date is required' });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be greater than or equal to start date'
      });
    }

    const coworkSpaceData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      businessType,
      addedDate: new Date(addedDate),
      totalSeats: seats,
      seatPerCost: cost,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      allottedBy: allocatedPerson
    };

    const coworkSpace = await coworkSpaceService.createCoworkSpace(
      coworkSpaceData,
      req.file
    );

    const entityName = `${coworkSpace.firstName || ''} ${coworkSpace.lastName || ''}`.trim() || 'Cowork Client';
    await activityService.logActivity({
      action: 'created',
      entityType: 'cowork_space',
      entityId: coworkSpace._id,
      entityName,
      actor: req.user,
      metadata: {
        totalSeats: coworkSpace.totalSeats,
        businessType: coworkSpace.businessType,
        seatPerCost: coworkSpace.seatPerCost
      }
    });

    broadcastDashboardUpdate({
      type: 'COWORK_SPACE_CREATED',
      entity: 'coworkSpace',
      entityId: coworkSpace._id,
      action: 'created'
    });

    res.status(201).json({
      success: true,
      message: 'Cowork space created successfully',
      data: {
        coworkSpace
      }
    });
  } catch (error) {
    next(error);
  }
};

const getCoworkSpaces = async (req, res, next) => {
  try {
    const coworkSpaces = await coworkSpaceService.getCoworkSpaces();

    res.status(200).json({
      success: true,
      data: {
        coworkSpaces
      }
    });
  } catch (error) {
    next(error);
  }
};

const getCoworkSpace = async (req, res, next) => {
  try {
    const coworkSpace = await coworkSpaceService.getCoworkSpaceById(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        coworkSpace
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateCoworkSpace = async (req, res, next) => {
  try {
    const existingRecord = await coworkSpaceService.getCoworkSpaceById(req.params.id);

    const {
      firstName,
      lastName,
      phone,
      email,
      businessType,
      addedDate,
      totalSeats,
      seatPerCost,
      startDate,
      endDate,
      allottedBy,
      allocatedBy
    } = req.body;

    const updateData = {};

    if (allottedBy !== undefined || allocatedBy !== undefined) {
      const person = (allottedBy !== undefined ? allottedBy : allocatedBy) || '';
      updateData.allottedBy = String(person).trim();
    }

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

    if (businessType !== undefined) {
      const allowedBusinessTypes = ['Register', 'Unregistered'];
      if (!allowedBusinessTypes.includes(businessType)) {
        return res.status(400).json({
          success: false,
          message: 'Business type must be either "Register" or "Unregistered"'
        });
      }
      updateData.businessType = businessType;
    }

    if (addedDate !== undefined) {
      if (isNaN(Date.parse(addedDate))) {
        return res.status(400).json({ success: false, message: 'Valid added date is required' });
      }
      updateData.addedDate = new Date(addedDate);
    }

    if (totalSeats !== undefined) {
      const seats = Number(String(totalSeats).trim());
      if (!Number.isInteger(seats) || seats <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Total seats must be a positive integer greater than 0'
        });
      }
      updateData.totalSeats = seats;
    }

    if (seatPerCost !== undefined) {
      const cost = Number(String(seatPerCost).trim());
      if (isNaN(cost) || cost <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Seat per cost must be a positive number greater than 0'
        });
      }
      updateData.seatPerCost = cost;
    }

    if (startDate !== undefined) {
      if (isNaN(Date.parse(startDate))) {
        return res.status(400).json({ success: false, message: 'Valid start date is required' });
      }
      updateData.startDate = new Date(startDate);
    }

    if (endDate !== undefined) {
      if (isNaN(Date.parse(endDate))) {
        return res.status(400).json({ success: false, message: 'Valid end date is required' });
      }
      updateData.endDate = new Date(endDate);
    }

    const effectiveStartDate = updateData.startDate || existingRecord.startDate;
    const effectiveEndDate = updateData.endDate || existingRecord.endDate;

    if (new Date(effectiveEndDate) < new Date(effectiveStartDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be greater than or equal to start date'
      });
    }

    const coworkSpace = await coworkSpaceService.updateCoworkSpace(
      req.params.id,
      updateData,
      req.file
    );

    const entityName = `${coworkSpace.firstName || ''} ${coworkSpace.lastName || ''}`.trim() || 'Cowork Client';
    await activityService.logActivity({
      action: 'updated',
      entityType: 'cowork_space',
      entityId: coworkSpace._id,
      entityName,
      actor: req.user,
      metadata: {
        totalSeats: coworkSpace.totalSeats,
        businessType: coworkSpace.businessType,
        seatPerCost: coworkSpace.seatPerCost
      }
    });

    broadcastDashboardUpdate({
      type: 'COWORK_SPACE_UPDATED',
      entity: 'coworkSpace',
      entityId: coworkSpace._id,
      action: 'updated'
    });

    res.status(200).json({
      success: true,
      message: 'Cowork space updated successfully',
      data: {
        coworkSpace
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteCoworkSpace = async (req, res, next) => {
  try {
    // Capture identity BEFORE deletion
    const existingRecord = await coworkSpaceService.getCoworkSpaceById(req.params.id);
    const entityName = `${existingRecord?.firstName || ''} ${existingRecord?.lastName || ''}`.trim() || 'Cowork Client';

    // Perform business deletion
    await coworkSpaceService.deleteCoworkSpace(req.params.id);

    // Persist delete activity only after successful deletion
    await activityService.logActivity({
      action: 'deleted',
      entityType: 'cowork_space',
      entityId: req.params.id,
      entityName,
      actor: req.user
    });

    broadcastDashboardUpdate({
      type: 'COWORK_SPACE_DELETED',
      entity: 'coworkSpace',
      entityId: req.params.id,
      action: 'deleted'
    });

    res.status(200).json({
      success: true,
      message: 'Cowork space deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCoworkSpace,
  getCoworkSpaces,
  getCoworkSpace,
  updateCoworkSpace,
  deleteCoworkSpace
};
