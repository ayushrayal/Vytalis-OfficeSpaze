const operationBillService = require('../services/operationBill.service');
const activityService = require('../services/activity.service');
const { broadcastDashboardUpdate } = require('../utils/dashboardBroadcaster.util');

const createOperationBill = async (req, res, next) => {
  try {
    const { date, expenseType, uploadedBy, status } = req.body;

    if (!date || isNaN(Date.parse(date))) {
      return res.status(400).json({ success: false, message: 'Valid date is required' });
    }

    if (!expenseType || typeof expenseType !== 'string' || !expenseType.trim()) {
      return res.status(400).json({ success: false, message: 'Expense type is required' });
    }

    if (!uploadedBy || typeof uploadedBy !== 'string' || !uploadedBy.trim()) {
      return res.status(400).json({ success: false, message: 'Uploaded by is required' });
    }

    if (!status || (status !== 'Due' && status !== 'Paid')) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "Due" or "Paid"'
      });
    }

    const operationBillData = {
      date: new Date(date),
      expenseType: expenseType.trim(),
      uploadedBy: uploadedBy.trim(),
      status
    };

    const operationBill = await operationBillService.createOperationBill(
      operationBillData,
      req.file
    );

    await activityService.logActivity({
      action: 'created',
      entityType: 'operation_bill',
      entityId: operationBill._id,
      entityName: operationBill.expenseType || 'Operation Expense',
      actor: req.user,
      metadata: {
        status: operationBill.status,
        date: operationBill.date
      }
    });

    broadcastDashboardUpdate({
      type: 'OPERATION_BILL_CREATED',
      entity: 'operationBill',
      entityId: operationBill._id,
      action: 'created'
    });

    res.status(201).json({
      success: true,
      message: 'Operation bill created successfully',
      data: {
        operationBill
      }
    });
  } catch (error) {
    next(error);
  }
};

const getOperationBills = async (req, res, next) => {
  try {
    const operationBills = await operationBillService.getOperationBills();

    res.status(200).json({
      success: true,
      data: {
        operationBills
      }
    });
  } catch (error) {
    next(error);
  }
};

const getOperationBill = async (req, res, next) => {
  try {
    const operationBill = await operationBillService.getOperationBillById(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        operationBill
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateOperationBill = async (req, res, next) => {
  try {
    const { date, expenseType, uploadedBy, status } = req.body;
    const updateData = {};

    if (date !== undefined) {
      if (isNaN(Date.parse(date))) {
        return res.status(400).json({ success: false, message: 'Valid date is required' });
      }
      updateData.date = new Date(date);
    }

    if (expenseType !== undefined) {
      if (typeof expenseType !== 'string' || !expenseType.trim()) {
        return res.status(400).json({ success: false, message: 'Expense type cannot be empty' });
      }
      updateData.expenseType = expenseType.trim();
    }

    if (uploadedBy !== undefined) {
      if (typeof uploadedBy !== 'string' || !uploadedBy.trim()) {
        return res.status(400).json({ success: false, message: 'Uploaded by cannot be empty' });
      }
      updateData.uploadedBy = uploadedBy.trim();
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

    const operationBill = await operationBillService.updateOperationBill(
      req.params.id,
      updateData,
      req.file
    );

    await activityService.logActivity({
      action: 'updated',
      entityType: 'operation_bill',
      entityId: operationBill._id,
      entityName: operationBill.expenseType || 'Operation Expense',
      actor: req.user,
      metadata: {
        status: operationBill.status,
        date: operationBill.date
      }
    });

    broadcastDashboardUpdate({
      type: 'OPERATION_BILL_UPDATED',
      entity: 'operationBill',
      entityId: operationBill._id,
      action: 'updated'
    });

    res.status(200).json({
      success: true,
      message: 'Operation bill updated successfully',
      data: {
        operationBill
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteOperationBill = async (req, res, next) => {
  try {
    // Capture identity BEFORE deletion
    const existingRecord = await operationBillService.getOperationBillById(req.params.id);
    const entityName = existingRecord?.expenseType || 'Operation Expense';

    // Perform business deletion
    await operationBillService.deleteOperationBill(req.params.id);

    // Persist delete activity only after successful deletion
    await activityService.logActivity({
      action: 'deleted',
      entityType: 'operation_bill',
      entityId: req.params.id,
      entityName,
      actor: req.user
    });

    broadcastDashboardUpdate({
      type: 'OPERATION_BILL_DELETED',
      entity: 'operationBill',
      entityId: req.params.id,
      action: 'deleted'
    });

    res.status(200).json({
      success: true,
      message: 'Operation bill deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOperationBill,
  getOperationBills,
  getOperationBill,
  updateOperationBill,
  deleteOperationBill
};
