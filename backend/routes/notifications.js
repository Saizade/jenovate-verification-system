const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/notifications - Get current notifications
router.get('/', async (req, res, next) => {
  try {
    let whereClause = {};

    // Admins see all, employees/students see their own (or admin sends info to specific user_id)
    if (req.user.role !== 'admin') {
      whereClause = { user_id: req.user.id };
    }

    const notifications = await Notification.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: 50
    });

    const unreadCount = await Notification.count({
      where: {
        ...whereClause,
        is_read: false
      }
    });

    return res.json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/:id/read - Mark single notification as read
router.put('/:id/read', async (req, res, next) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check permission: non-admins can only mark their own notifications
    if (req.user.role !== 'admin' && notification.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    notification.is_read = true;
    await notification.save();

    return res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/read-all - Mark all as read
router.put('/read-all', async (req, res, next) => {
  try {
    let whereClause = {};
    if (req.user.role !== 'admin') {
      whereClause = { user_id: req.user.id };
    }

    await Notification.update(
      { is_read: true },
      { where: { ...whereClause, is_read: false } }
    );

    return res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
