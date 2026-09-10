const dedicatedSpaceService = require('../services/dedicatedSpace.service');
const activityService = require('../services/activity.service');
const { broadcastDashboardUpdate } = require('../utils/dashboardBroadcaster.util');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createDedicatedSpace = async (req, res, next) => {
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

    const allowedBusinessTypes = ['Register', 'Unregistered'];
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

    const dedicatedSpaceData = {
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

    const dedicatedSpace = await dedicatedSpaceService.createDedicatedSpace(
      dedicatedSpaceData,
      req.file
    );

    const entityName = `${dedicatedSpace.firstName || ''} ${dedicatedSpace.lastName || ''}`.trim() || 'Dedicated Client';
    await activityService.logActivity({
      action: 'created',
      entityType: 'dedicated_space',
      entityId: dedicatedSpace._id,
      entityName,
      actor: req.user,
      metadata: {
        totalSeats: dedicatedSpace.totalSeats,
        businessType: dedicatedSpace.businessType,
        seatPerCost: dedicatedSpace.seatPerCost
      }
    });

    broadcastDashboardUpdate({
      type: 'DEDICATED_SPACE_CREATED',
      entity: 'dedicatedSpace',
      entityId: dedicatedSpace._id,
      action: 'created'
    });

    res.status(201).json({
      success: true,
      message: 'Dedicated space created successfully',
      data: {
        dedicatedSpace
      }
    });
  } catch (error) {
    next(error);
  }
};

const getDedicatedSpaces = async (req, res, next) => {
  try {
    const dedicatedSpaces = await dedicatedSpaceService.getDedicatedSpaces();

    res.status(200).json({
      success: true,
      data: {
        dedicatedSpaces
      }
    });
  } catch (error) {
    next(error);
  }
};

const getDedicatedSpace = async (req, res, next) => {
  try {
    const dedicatedSpace = await dedicatedSpaceService.getDedicatedSpaceById(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        dedicatedSpace
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateDedicatedSpace = async (req, res, next) => {
  try {
    const existingRecord = await dedicatedSpaceService.getDedicatedSpaceById(req.params.id);

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
      const allowedBusinessTypes = ['Register', 'Unregistered', 'Registor', 'Non Registor'];
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

    const dedicatedSpace = await dedicatedSpaceService.updateDedicatedSpace(
      req.params.id,
      updateData,
      req.file
    );

    const entityName = `${dedicatedSpace.firstName || ''} ${dedicatedSpace.lastName || ''}`.trim() || 'Dedicated Client';
    await activityService.logActivity({
      action: 'updated',
      entityType: 'dedicated_space',
      entityId: dedicatedSpace._id,
      entityName,
      actor: req.user,
      metadata: {
        totalSeats: dedicatedSpace.totalSeats,
        businessType: dedicatedSpace.businessType,
        seatPerCost: dedicatedSpace.seatPerCost
      }
    });

    broadcastDashboardUpdate({
      type: 'DEDICATED_SPACE_UPDATED',
      entity: 'dedicatedSpace',
      entityId: dedicatedSpace._id,
      action: 'updated'
    });

    res.status(200).json({
      success: true,
      message: 'Dedicated space updated successfully',
      data: {
        dedicatedSpace
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteDedicatedSpace = async (req, res, next) => {
  try {
    // Capture identity BEFORE deletion
    const existingRecord = await dedicatedSpaceService.getDedicatedSpaceById(req.params.id);
    const entityName = `${existingRecord?.firstName || ''} ${existingRecord?.lastName || ''}`.trim() || 'Dedicated Client';

    // Perform business deletion
    await dedicatedSpaceService.deleteDedicatedSpace(req.params.id);

    // Persist delete activity only after successful deletion
    await activityService.logActivity({
      action: 'deleted',
      entityType: 'dedicated_space',
      entityId: req.params.id,
      entityName,
      actor: req.user
    });

    broadcastDashboardUpdate({
      type: 'DEDICATED_SPACE_DELETED',
      entity: 'dedicatedSpace',
      entityId: req.params.id,
      action: 'deleted'
    });

    res.status(200).json({
      success: true,
      message: 'Dedicated space deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDedicatedSpace,
  getDedicatedSpaces,
  getDedicatedSpace,
  updateDedicatedSpace,
  deleteDedicatedSpace
};
