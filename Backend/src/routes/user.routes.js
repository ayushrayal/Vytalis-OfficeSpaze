const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/permission.middleware');
const {
  listUsers,
  getUser,
  createUser,
  updateUser,
  updateUserStatus,
  updateUserRole,
  updateUserPermissions,
  resetUserPassword,
  deleteUser
} = require('../controllers/user.controller');

// All user management routes require authentication + Admin role
router.use(authMiddleware, requireAdmin);

router.get('/', listUsers);
router.post('/', createUser);

router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

router.patch('/:id/status', updateUserStatus);
router.patch('/:id/role', updateUserRole);
router.patch('/:id/permissions', updateUserPermissions);
router.patch('/:id/password', resetUserPassword);

module.exports = router;
