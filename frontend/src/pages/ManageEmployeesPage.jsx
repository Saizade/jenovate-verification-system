import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../services/api';

import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';

import { HiUserPlus, HiPencilSquare, HiTrash, HiMagnifyingGlass, HiUserGroup } from 'react-icons/hi2';

export default function ManageEmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form setups
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd }
  } = useForm();

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    setValue: setValueEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit }
  } = useForm();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employees');
      if (res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load employee list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const onAddSubmit = async (data) => {
    setActionLoading(true);
    try {
      const res = await api.post('/employees', data);
      if (res.data.success) {
        toast.success('Employee created successfully!');
        setShowAddModal(false);
        resetAdd();
        fetchEmployees();
      } else {
        toast.error(res.data.message || 'Creation failed');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error creating employee profile.');
    } finally {
      setActionLoading(false);
    }
  };

  const onEditSubmit = async (data) => {
    setActionLoading(true);
    try {
      // Clean request data (don't send empty password)
      const payload = {
        name: data.name,
        email: data.email,
        role: data.role
      };
      if (data.password) {
        payload.password = data.password;
      }

      const res = await api.put(`/employees/${selectedEmployee.id}`, payload);
      if (res.data.success) {
        toast.success('Employee details updated successfully!');
        setShowEditModal(false);
        resetEdit();
        fetchEmployees();
      } else {
        toast.error(res.data.message || 'Update failed');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error updating employee profile.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      const res = await api.delete(`/employees/${selectedEmployee.id}`);
      if (res.data.success) {
        toast.success('Employee profile deleted successfully.');
        setShowDeleteModal(false);
        fetchEmployees();
      } else {
        toast.error(res.data.message || 'Delete failed');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error deleting employee profile.');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (emp) => {
    setSelectedEmployee(emp);
    setValueEdit('name', emp.name);
    setValueEdit('email', emp.email);
    setValueEdit('role', emp.role);
    setShowEditModal(true);
  };

  const openDeleteModal = (emp) => {
    setSelectedEmployee(emp);
    setShowDeleteModal(true);
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-950 tracking-tight">
            Manage Employees
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure registration coordinators, assign admin privileges, and secure login credentials.
          </p>
        </div>

        <Button
          variant="primary"
          className="flex items-center gap-1.5 self-start bg-primary-950 hover:bg-primary-900"
          onClick={() => setShowAddModal(true)}
        >
          <HiUserPlus className="w-5 h-5" /> Add Coordinator
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by name or email address..."
            className="form-input pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <HiMagnifyingGlass className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-400" />
        </div>
      </Card>

      {/* Employees Table */}
      <Card className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="table-row" />
            ))}
          </div>
        ) : filteredEmployees.length > 0 ? (
          <Table
            headers={['Name', 'Email Address', 'Role', 'Date Added', 'Actions']}
            rows={filteredEmployees.map((emp) => [
              <span className="font-semibold text-gray-800" key={emp.id}>{emp.name}</span>,
              <span className="text-gray-650" key={emp.id}>{emp.email}</span>,
              <div key={emp.id}>
                {emp.role === 'admin' ? (
                  <Badge variant="info">Admin</Badge>
                ) : (
                  <Badge variant="neutral">Coordinator</Badge>
                )}
              </div>,
              <span className="text-xs text-gray-400" key={emp.id}>
                {emp.created_at ? new Date(emp.created_at).toLocaleDateString() : '—'}
              </span>,
              <div className="flex gap-2" key={emp.id}>
                <Button variant="ghost" className="p-1 text-primary-600" onClick={() => openEditModal(emp)}>
                  <HiPencilSquare className="w-4.5 h-4.5" />
                </Button>
                <Button variant="ghost" className="p-1 text-red-500" onClick={() => openDeleteModal(emp)}>
                  <HiTrash className="w-4.5 h-4.5" />
                </Button>
              </div>
            ])}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-surface-50 border border-dashed border-gray-200 rounded-2xl">
            <HiUserGroup className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-700">No Coordinators Found</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Configure coordinators to delegate enrollment input permissions.
            </p>
          </div>
        )}
      </Card>

      {/* Add Employee Modal */}
      {showAddModal && (
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create Coordinator Account" size="sm">
          <form onSubmit={handleSubmitAdd(onAddSubmit)} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-450 uppercase block mb-1">Full Name</label>
              <input
                type="text"
                className={`form-input ${errorsAdd.name ? 'border-red-300' : ''}`}
                placeholder="e.g. Rahul Sharma"
                {...registerAdd('name', { required: 'Name is required' })}
              />
              {errorsAdd.name && <p className="text-xs text-red-500 mt-1">{errorsAdd.name.message}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-450 uppercase block mb-1">Email Address</label>
              <input
                type="email"
                className={`form-input ${errorsAdd.email ? 'border-red-300' : ''}`}
                placeholder="coordinators.name@jenovate.com"
                {...registerAdd('email', { required: 'Email is required' })}
              />
              {errorsAdd.email && <p className="text-xs text-red-500 mt-1">{errorsAdd.email.message}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-450 uppercase block mb-1">Temporary Password</label>
              <input
                type="password"
                className={`form-input ${errorsAdd.password ? 'border-red-300' : ''}`}
                placeholder="At least 6 characters"
                {...registerAdd('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Must be at least 6 characters' }
                })}
              />
              {errorsAdd.password && <p className="text-xs text-red-500 mt-1">{errorsAdd.password.message}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-450 uppercase block mb-1">Account Role</label>
              <select
                className={`form-input ${errorsAdd.role ? 'border-red-300' : ''}`}
                {...registerAdd('role', { required: 'Role selection required' })}
              >
                <option value="employee">Coordinator</option>
                <option value="admin">Administrator</option>
              </select>
              {errorsAdd.role && <p className="text-xs text-red-500 mt-1">{errorsAdd.role.message}</p>}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-150 gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={actionLoading}>
                Create Account
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Update Coordinator Profile" size="sm">
          <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-450 uppercase block mb-1">Full Name</label>
              <input
                type="text"
                className={`form-input ${errorsEdit.name ? 'border-red-300' : ''}`}
                {...registerEdit('name', { required: 'Name is required' })}
              />
              {errorsEdit.name && <p className="text-xs text-red-500 mt-1">{errorsEdit.name.message}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-450 uppercase block mb-1">Email Address</label>
              <input
                type="email"
                className={`form-input ${errorsEdit.email ? 'border-red-300' : ''}`}
                {...registerEdit('email', { required: 'Email is required' })}
              />
              {errorsEdit.email && <p className="text-xs text-red-500 mt-1">{errorsEdit.email.message}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-450 uppercase block mb-1">New Password (Optional)</label>
              <input
                type="password"
                className={`form-input ${errorsEdit.password ? 'border-red-300' : ''}`}
                placeholder="Leave blank to keep current"
                {...registerEdit('password', {
                  minLength: { value: 6, message: 'Must be at least 6 characters' }
                })}
              />
              {errorsEdit.password && <p className="text-xs text-red-500 mt-1">{errorsEdit.password.message}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-450 uppercase block mb-1">Account Role</label>
              <select
                className={`form-input ${errorsEdit.role ? 'border-red-300' : ''}`}
                {...registerEdit('role', { required: 'Role selection required' })}
              >
                <option value="employee">Coordinator</option>
                <option value="admin">Administrator</option>
              </select>
              {errorsEdit.role && <p className="text-xs text-red-500 mt-1">{errorsEdit.role.message}</p>}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-150 gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={actionLoading}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEmployee && (
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Deactivate Employee Profile" size="sm">
          <div className="space-y-4">
            <p className="text-sm text-gray-650">
              Are you sure you want to delete coordinator account for{' '}
              <strong>{selectedEmployee.name}</strong> ({selectedEmployee.email})?
            </p>
            <p className="text-xs text-red-500 font-semibold bg-red-50 border border-red-150 p-3 rounded-xl">
              ⚠️ Warning: This operation is permanent. They will no longer be able to log in or submit student entries.
            </p>
            <div className="flex justify-end pt-4 border-t border-gray-150 gap-2">
              <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteConfirm} loading={actionLoading}>
                Delete Coordinator
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
