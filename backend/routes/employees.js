const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Employee } = require('../models');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All employee management routes are Admin only
router.use(auth);
router.use(roleCheck(['admin']));

// GET /api/employees - List all employees
router.get('/', async (req, res, next) => {
  try {
    const employees = await Employee.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });

    return res.json({
      success: true,
      message: 'Employees retrieved successfully',
      data: employees
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/employees - Create employee
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'employee']).withMessage('Role must be admin or employee')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { name, email, password, role } = req.body;

      // Check if email already exists
      const existing = await Employee.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use'
        });
      }

      const newEmployee = await Employee.create({
        name,
        email,
        password,
        role
      });

      return res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: {
          id: newEmployee.id,
          name: newEmployee.name,
          email: newEmployee.email,
          role: newEmployee.role,
          created_at: newEmployee.created_at
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/employees/:id - Update employee (name, email, role, and optionally password)
router.put(
  '/:id',
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty').trim(),
    body('email').optional().isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'employee']).withMessage('Role must be admin or employee')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const employee = await Employee.findByPk(req.params.id);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      const { name, email, password, role } = req.body;

      // Check email conflict
      if (email && email !== employee.email) {
        const conflict = await Employee.findOne({ where: { email } });
        if (conflict) {
          return res.status(409).json({
            success: false,
            message: 'Email already in use'
          });
        }
        employee.email = email;
      }

      if (name) employee.name = name;
      if (role) employee.role = role;
      if (password) employee.password = password; // Hashing done in hook

      await employee.save();

      return res.json({
        success: true,
        message: 'Employee updated successfully',
        data: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
          updated_at: employee.updatedAt
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/employees/:id - Delete employee
router.delete('/:id', async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Prevent deleting self
    if (employee.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own admin account'
      });
    }

    await employee.destroy();

    return res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
