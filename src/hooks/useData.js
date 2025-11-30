import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export function useData(endpoint, initialData = []) {
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const response = await fetch(`http://localhost:3000/api/${endpoint}`, {
                headers
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Handle unauthorized if needed, maybe redirect or just throw
                    throw new Error('Unauthorized');
                }
                throw new Error(`Error fetching ${endpoint}`);
            }

            const result = await response.json();
            setData(result);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err.message);
            // Don't wipe data on error if we want to show stale data, but usually we might want to know
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addItem = async (item) => {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };

            const response = await fetch(`http://localhost:3000/api/${endpoint}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(item),
            });

            if (!response.ok) throw new Error('Failed to add item');

            const newItem = await response.json();
            setData(prev => [...prev, newItem]);
            toast.success('Item added successfully');
            return newItem;
        } catch (err) {
            console.error(err);
            toast.error('Failed to add item');
            throw err;
        }
    };

    const updateItem = async (id, updates) => {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };

            const response = await fetch(`http://localhost:3000/api/${endpoint}/${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(updates),
            });

            if (!response.ok) throw new Error('Failed to update item');

            const updatedItem = await response.json();
            setData(prev => prev.map(item => item.id === id ? updatedItem : item));
            toast.success('Item updated successfully');
            return updatedItem;
        } catch (err) {
            console.error(err);
            toast.error('Failed to update item');
            throw err;
        }
    };

    const deleteItem = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const response = await fetch(`http://localhost:3000/api/${endpoint}/${id}`, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) throw new Error('Failed to delete item');

            setData(prev => prev.filter(item => item.id !== id));
            toast.success('Item deleted successfully');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete item');
            throw err;
        }
    };

    return { data, loading, error, addItem, updateItem, deleteItem, refresh: fetchData };
}
