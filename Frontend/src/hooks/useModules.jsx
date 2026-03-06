import { useState, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

export const useModules = () => {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchModules = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/modules');
            setModules(response.data.data);
            return response.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Error fetching modules';
            setError(errorMsg);
            toast.error(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createModule = async (moduleData) => {
        setLoading(true);
        try {
            const response = await api.post('/modules', moduleData);
            setModules(prev => [...prev, response.data.data]);
            toast.success('Module created successfully');
            return response.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Error creating module';
            toast.error(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateModule = async (id, moduleData) => {
        setLoading(true);
        try {
            const response = await api.put(`/modules/${id}`, moduleData);
            setModules(prev => prev.map(m => m._id === id ? response.data.data : m));
            toast.success('Module updated successfully');
            return response.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Error updating module';
            toast.error(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteModule = async (id) => {
        setLoading(true);
        try {
            const response = await api.delete(`/modules/${id}`);
            setModules(prev => prev.filter(m => m._id !== id));
            toast.success('Module deleted successfully');
            return response.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Error deleting module';
            toast.error(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        modules,
        loading,
        error,
        fetchModules,
        createModule,
        updateModule,
        deleteModule
    };
};
