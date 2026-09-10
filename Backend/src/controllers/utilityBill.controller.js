const utilityBillService = require('../services/utilityBill.service');
const activityService = require('../services/activity.service');
const { broadcastDashboardUpdate } = require('../utils/dashboardBroadcaster.util');

const createUtilityBill = async (req, res, next) => {
  try {
    const { billName, billAmount, uploadedBy, status, isPaused } = req.body;

    if (!billName || typeof billName !== 'string' || !billName.trim()) {
      return res.status(400).json({ success: false, message: 'Bill name is required' });
    }

    if (!uploadedBy || typeof uploadedBy !== 'string' || !uploadedBy.trim()) {
      return res.status(400).json({ success: false, message: 'Uploaded by is required' });
    }

    if (billAmount === undefined || billAmount === null || String(billAmount).trim() === '') {
      return res.status(400).json({ success: false, message: 'Bill amount is required' });
    }

    const amount = Number(String(billAmount).trim());
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Bill amount must be a positive number greater than 0'
      });
    }

    if (status !== undefined && status !== 'Due' && status !== 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "Due" or "Paid"'
      });
    }

    let parsedIsPaused = false;
    if (isPaused !== undefined) {
      if (typeof isPaused === 'boolean') {
        parsedIsPaused = isPaused;
      } else if (String(isPaused).trim() === 'true') {
        parsedIsPaused = true;
      } else if (String(isPaused).trim() === 'false') {
        parsedIsPaused = false;
      } else {
        return res.status(400).json({ success: false, message: 'isPaused must be a boolean' });
      }
    }

    const utilityBillData = {
      billName: billName.trim(),
      billAmount: amount,
      uploadedBy: uploadedBy.trim(),
      status: status || 'Due',
      isPaused: parsedIsPaused
    };

    const utilityBill = await utilityBillService.createUtilityBill(utilityBillData, req.file);

    await activityService.logActivity({
      action: 'created',
      entityType: 'utility_bill',
      entityId: utilityBill._id,
      entityName: utilityBill.billName || 'Utility Bill',
      actor: req.user,
      metadata: {
        billAmount: utilityBill.billAmount,
        status: utilityBill.status
      }
    });

    broadcastDashboardUpdate({
      type: 'UTILITY_BILL_CREATED',
      entity: 'utilityBill',
      entityId: utilityBill._id,
      action: 'created'
    });

    res.status(201).json({
      success: true,
      message: 'Utility bill created successfully',
      data: {
        utilityBill
      }
    });
  } catch (error) {
    next(error);
  }
};

const getUtilityBills = async (req, res, next) => {
  try {
    const utilityBills = await utilityBillService.getUtilityBills();

    res.status(200).json({
      success: true,
      data: {
        utilityBills
      }
    });
  } catch (error) {
    next(error);
  }
};

const getDueBills = async (req, res, next) => {
  try {
    const data = await utilityBillService.getDueUtilityBills();

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const getUtilityBill = async (req, res, next) => {
  try {
    const utilityBill = await utilityBillService.getUtilityBillById(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        utilityBill
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateUtilityBill = async (req, res, next) => {
  try {
    const { billName, billAmount, uploadedBy, status, isPaused } = req.body;
    const updateData = {};

    if (billName !== undefined) {
      if (typeof billName !== 'string' || !billName.trim()) {
        return res.status(400).json({ success: false, message: 'Bill name cannot be empty' });
      }
      updateData.billName = billName.trim();
    }

    if (uploadedBy !== undefined) {
      if (typeof uploadedBy !== 'string' || !uploadedBy.trim()) {
        return res.status(400).json({ success: false, message: 'Uploaded by cannot be empty' });
      }
      updateData.uploadedBy = uploadedBy.trim();
    }

    if (billAmount !== undefined) {
      const amount = Number(String(billAmount).trim());
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Bill amount must be a positive number greater than 0'
        });
      }
      updateData.billAmount = amount;
    }

    if (status !== undefined) {
      if (status !== 'Due' && status !== 'Paid') {
        return res.status(400).json({
          success: false,
          message: 'Status must be either "Due" or "Paid"'
        });
      }
      updateData.status = status;
    }

    if (isPaused !== undefined) {
      if (typeof isPaused === 'boolean') {
        updateData.isPaused = isPaused;
      } else if (String(isPaused).trim() === 'true') {
        updateData.isPaused = true;
      } else if (String(isPaused).trim() === 'false') {
        updateData.isPaused = false;
      } else {
        return res.status(400).json({ success: false, message: 'isPaused must be a boolean' });
      }
    }

    const utilityBill = await utilityBillService.updateUtilityBill(
      req.params.id,
      updateData,
      req.file
    );

    await activityService.logActivity({
      action: 'updated',
      entityType: 'utility_bill',
      entityId: utilityBill._id,
      entityName: utilityBill.billName || 'Utility Bill',
      actor: req.user,
      metadata: {
        billAmount: utilityBill.billAmount,
        status: utilityBill.status
      }
    });

    broadcastDashboardUpdate({
      type: 'UTILITY_BILL_UPDATED',
      entity: 'utilityBill',
      entityId: utilityBill._id,
      action: 'updated'
    });

    res.status(200).json({
      success: true,
      message: 'Utility bill updated successfully',
      data: {
        utilityBill
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteUtilityBill = async (req, res, next) => {
  try {
    // Capture identity BEFORE deletion
    const existingRecord = await utilityBillService.getUtilityBillById(req.params.id);
    const entityName = existingRecord?.billName || 'Utility Bill';

    // Perform business deletion
    await utilityBillService.deleteUtilityBill(req.params.id);

    // Persist delete activity only after successful deletion
    await activityService.logActivity({
      action: 'deleted',
      entityType: 'utility_bill',
      entityId: req.params.id,
      entityName,
      actor: req.user
    });

    broadcastDashboardUpdate({
      type: 'UTILITY_BILL_DELETED',
      entity: 'utilityBill',
      entityId: req.params.id,
      action: 'deleted'
    });

    res.status(200).json({
      success: true,
      message: 'Utility bill deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUtilityBill,
  getUtilityBills,
  getDueBills,
  getUtilityBill,
  updateUtilityBill,
  deleteUtilityBill
};
