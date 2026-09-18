const userService = require('../services/user.service');
const { broadcastDashboardUpdate } = require('../utils/dashboardBroadcaster.util');

// ─── GET /api/users ──────────────────────────────────────────────────────────

const listUsers = async (req, res, next) => {
  try {
    const { page, limit, search, role, status } = req.query;

    const result = await userService.getUsers({
      page,
      limit,
      search,
      role,
      status
    });

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: result.users,
        metrics: result.metrics
      },
      meta: {
        pagination: result.pagination
      },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/users/:id ──────────────────────────────────────────────────────

const getUser = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'User retrieved',
      data: { user },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/users ─────────────────────────────────────────────────────────

const createUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, role, password, status, permissions } = req.body;

    const user = await userService.createUser(
      {
        firstName,
        lastName,
        email,
        phone,
        role,
        password,
        status,
        permissions
      },
      req.user
    );

    // Broadcast real-time SSE event on success
    broadcastDashboardUpdate({
      type: 'USER_MUTATED',
      entity: 'user',
      entityId: user._id,
      action: 'created'
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/users/:id ──────────────────────────────────────────────────────

const updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, email, role, status, permissions } = req.body;

    const user = await userService.updateUser(
      req.params.id,
      {
        firstName,
        lastName,
        phone,
        email,
        role,
        status,
        permissions
      },
      req.user
    );

    // Broadcast real-time SSE event on success
    broadcastDashboardUpdate({
      type: 'USER_MUTATED',
      entity: 'user',
      entityId: user._id,
      action: 'updated'
    });

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/users/:id/status ─────────────────────────────────────────────

const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const user = await userService.updateUserStatus(req.params.id, status, req.user);

    // Broadcast real-time SSE event on success
    broadcastDashboardUpdate({
      type: 'USER_MUTATED',
      entity: 'user',
      entityId: user._id,
      action: status === 'ACTIVE' ? 'user_activated' : 'user_deactivated'
    });

    return res.status(200).json({
      success: true,
      message: `User ${status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`,
      data: { user },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/users/:id/role ───────────────────────────────────────────────

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    const user = await userService.updateUserRole(req.params.id, role, req.user);

    // Broadcast real-time SSE event on success
    broadcastDashboardUpdate({
      type: 'USER_MUTATED',
      entity: 'user',
      entityId: user._id,
      action: 'role_updated'
    });

    return res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: { user },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/users/:id/permissions ────────────────────────────────────────

const updateUserPermissions = async (req, res, next) => {
  try {
    const { permissions } = req.body;

    const user = await userService.updateUserPermissions(req.params.id, permissions, req.user);

    // Broadcast real-time SSE event on success
    broadcastDashboardUpdate({
      type: 'USER_MUTATED',
      entity: 'user',
      entityId: user._id,
      action: 'permissions_updated'
    });

    return res.status(200).json({
      success: true,
      message: 'User permissions updated successfully',
      data: { user },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/users/:id/password ───────────────────────────────────────────

const resetUserPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    await userService.resetUserPassword(req.params.id, newPassword, req.user);

    // Broadcast real-time SSE event on success
    broadcastDashboardUpdate({
      type: 'USER_MUTATED',
      entity: 'user',
      entityId: req.params.id,
      action: 'password_reset'
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. User will need to log in again.',
      data: null,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/users/:id ───────────────────────────────────────────────────

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id, req.user);

    // Broadcast real-time SSE event on success
    broadcastDashboardUpdate({
      type: 'USER_MUTATED',
      entity: 'user',
      entityId: req.params.id,
      action: 'deleted'
    });

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: null,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  updateUserStatus,
  updateUserRole,
  updateUserPermissions,
  resetUserPassword,
  deleteUser
};
