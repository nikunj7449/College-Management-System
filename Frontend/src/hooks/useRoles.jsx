import { useState, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

export const useRoles = () => {
    const [roles, setRoles] = useState([]);
    const [systemModules, setSystemModules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSystemModules = useCallback(async () => {
        try {
            const response = await api.get('/roles/modules');
            setSystemModules(response.data.data);
            return response.data.data;
        } catch (err) {
            console.error('Failed to fetch system modules', err);
            return [];
        }
    }, []);

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/roles');
            setRoles(response.data.data);
            return response.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Error fetching roles';
            setError(errorMsg);
            toast.error(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createRole = async (roleData) => {
        setLoading(true);
        try {
            const response = await api.post('/roles', roleData);
            setRoles(prev => [response.data.data, ...prev]);
            toast.success('Role created successfully');
            return response.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Error creating role';
            toast.error(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateRole = async (id, roleData) => {
        setLoading(true);
        try {
            const response = await api.put(`/roles/${id}`, roleData);
            setRoles(prev => prev.map(r => r._id === id ? response.data.data : r));
            toast.success('Role updated successfully');
            return response.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Error updating role';
            toast.error(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteRole = async (id) => {
        setLoading(true);
        try {
            const response = await api.delete(`/roles/${id}`);
            setRoles(prev => prev.filter(r => r._id !== id));
            toast.success('Role deleted successfully');
            return response.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Error deleting role';
            toast.error(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        roles,
        systemModules,
        loading,
        error,
        fetchRoles,
        fetchSystemModules,
        createRole,
        updateRole,
        deleteRole
    };
};
