import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Building2, Users, Wrench, Briefcase, MapPin, AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';
import { useData } from '../hooks/useData';

export function Registries({
    companies, onAddCompany, onUpdateCompany, onDeleteCompany,
    employees, onAddEmployee, onUpdateEmployee, onDeleteEmployee,
    services, onAddService, onUpdateService, onDeleteService,
    clients, onAddClient, onUpdateClient, onDeleteClient,
    coverageReasons, onAddCoverageReason, onUpdateCoverageReason, onDeleteCoverageReason,
    user
}) {
    const [activeTab, setActiveTab] = useState('companies');
    const { data: users, addItem: addUser, updateItem: updateUser, deleteItem: deleteUser } = useData('users', []);

    const tabs = [
        { id: 'companies', label: 'Empresas', icon: Building2 },
        { id: 'employees', label: 'Colaboradores', icon: Users },
        { id: 'services', label: 'Serviços', icon: Wrench },
        { id: 'clients', label: 'Clientes', icon: Briefcase },
        { id: 'coverage-reasons', label: 'Motivos de Cobertura', icon: AlertCircle },
    ];

    if (user?.role === 'admin') {
        tabs.push({ id: 'users', label: 'Usuários', icon: Shield });
    }

    const checkPermission = (action) => {
        if (user?.role === 'admin') return true;
        try {
            const perms = typeof user?.permissions === 'string' ? JSON.parse(user.permissions) : user?.permissions;
            return perms?.registries?.[action] === true;
        } catch (e) {
            return false;
        }
    };

    const canCreate = checkPermission('create');
    const canEdit = checkPermission('edit');
    const canDelete = checkPermission('delete');

    return (
        <div className="space-y-6">
            <div className="flex space-x-4 border-b border-gray-200 pb-2 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <tab.icon size={18} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                {activeTab === 'companies' && (
                    <RegistrySection
                        title="Empresas"
                        items={companies}
                        onAdd={onAddCompany}
                        onUpdate={onUpdateCompany}
                        onDelete={onDeleteCompany}
                        fields={[
                            { name: 'name', label: 'Nome', type: 'text', required: true },
                            { name: 'cnpj', label: 'CNPJ', type: 'text' },
                            { name: 'address', label: 'Endereço', type: 'text' },
                            { name: 'phone', label: 'Telefone', type: 'text' },
                            { name: 'email', label: 'Email', type: 'email' }
                        ]}
                        canCreate={canCreate}
                        canEdit={canEdit}
                        canDelete={canDelete}
                    />
                )}
                {activeTab === 'employees' && (
                    <RegistrySection
                        title="Colaboradores"
                        items={employees}
                        onAdd={onAddEmployee}
                        onUpdate={onUpdateEmployee}
                        onDelete={onDeleteEmployee}
                        fields={[
                            { name: 'name', label: 'Nome', type: 'text', required: true },
                            { name: 'role', label: 'Função', type: 'select', options: ['Freelancer', 'CLT'], required: true },
                            { name: 'cpf', label: 'CPF', type: 'text' },
                            { name: 're', label: 'RE', type: 'text' },
                            { name: 'email', label: 'Email', type: 'email' },
                            { name: 'phone', label: 'Telefone', type: 'text' }
                        ]}
                        canCreate={canCreate}
                        canEdit={canEdit}
                        canDelete={canDelete}
                    />
                )}
                {activeTab === 'services' && (
                    <RegistrySection
                        title="Serviços"
                        items={services}
                        onAdd={onAddService}
                        onUpdate={onUpdateService}
                        onDelete={onDeleteService}
                        fields={[
                            { name: 'name', label: 'Nome', type: 'text', required: true },
                            { name: 'defaultValue', label: 'Valor Padrão', type: 'number', step: '0.01' },
                            { name: 'description', label: 'Descrição', type: 'text' }
                        ]}
                        canCreate={canCreate}
                        canEdit={canEdit}
                        canDelete={canDelete}
                    />
                )}
                {activeTab === 'clients' && (
                    <RegistrySection
                        title="Clientes"
                        items={clients}
                        onAdd={onAddClient}
                        onUpdate={onUpdateClient}
                        onDelete={onDeleteClient}
                        fields={[
                            { name: 'name', label: 'Nome', type: 'text', required: true },
                            { name: 'document', label: 'CNPJ/CPF', type: 'text' },
                            { name: 'address', label: 'Endereço', type: 'text' },
                            { name: 'phone', label: 'Telefone', type: 'text' },
                            { name: 'email', label: 'Email', type: 'email' }
                        ]}
                        hasPosts={true}
                        canCreate={canCreate}
                        canEdit={canEdit}
                        canDelete={canDelete}
                    />
                )}
                {activeTab === 'coverage-reasons' && (
                    <RegistrySection
                        title="Motivos de Cobertura"
                        items={coverageReasons}
                        onAdd={onAddCoverageReason}
                        onUpdate={onUpdateCoverageReason}
                        onDelete={onDeleteCoverageReason}
                        fields={[
                            { name: 'name', label: 'Motivo', type: 'text', required: true }
                        ]}
                        canCreate={canCreate}
                        canEdit={canEdit}
                        canDelete={canDelete}
                    />
                )}
                {activeTab === 'users' && user?.role === 'admin' && (
                    <UserRegistrySection
                        users={users}
                        onAdd={addUser}
                        onUpdate={updateUser}
                        onDelete={deleteUser}
                    />
                )}
            </div>
        </div>
    );
}

function RegistrySection({ title, items, onAdd, onUpdate, onDelete, fields, hasPosts, canCreate, canEdit, canDelete }) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});
    const [posts, setPosts] = useState([]);

    const handleStartAdd = () => {
        setFormData({});
        setPosts([]);
        setIsAdding(true);
        setEditingId(null);
    };

    const handleStartEdit = (item) => {
        setFormData(item);
        setPosts(item.posts || []);
        setEditingId(item.id);
        setIsAdding(false);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({});
        setPosts([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSave = { ...formData, posts };
            if (isAdding) {
                await onAdd(dataToSave);
            } else if (editingId) {
                await onUpdate(editingId, dataToSave);
            }
            handleCancel();
        } catch (error) {
            console.error("Error saving item:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddPost = () => {
        setPosts([...posts, '']);
    };

    const handlePostChange = (index, value) => {
        const newPosts = [...posts];
        newPosts[index] = value;
        setPosts(newPosts);
    };

    const handleRemovePost = (index) => {
        const newPosts = posts.filter((_, i) => i !== index);
        setPosts(newPosts);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                {!isAdding && !editingId && canCreate && (
                    <button
                        onClick={handleStartAdd}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={18} />
                        <span>Adicionar {title.slice(0, -1)}</span>
                    </button>
                )}
            </div>

            {(isAdding || editingId) && (
                <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {fields.map(field => (
                            <div key={field.name}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {field.label}
                                </label>
                                {field.type === 'select' ? (
                                    <select
                                        name={field.name}
                                        value={formData[field.name] || ''}
                                        onChange={handleChange}
                                        required={field.required}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Selecione {field.label}</option>
                                        {field.options.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={formData[field.name] || ''}
                                        onChange={handleChange}
                                        required={field.required}
                                        step={field.step}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {hasPosts && (
                        <div className="mb-6 bg-white p-4 rounded border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Postos de Trabalho
                                </label>
                                <button
                                    type="button"
                                    onClick={handleAddPost}
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                    <Plus size={14} /> Adicionar Posto
                                </button>
                            </div>
                            {posts.length === 0 && (
                                <p className="text-sm text-gray-400 italic">Nenhum posto cadastrado.</p>
                            )}
                            <div className="space-y-2">
                                {posts.map((post, index) => (
                                    <div key={index} className="flex gap-2">
                                        <div className="relative flex-1">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <MapPin size={14} className="text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={post}
                                                onChange={(e) => handlePostChange(index, e.target.value)}
                                                placeholder="Nome do Posto"
                                                className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePost(index)}
                                            className="text-red-500 hover:text-red-700 p-2"
                                            title="Remover Posto"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                            <Save size={18} />
                            <span>Salvar</span>
                        </button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {fields.map(field => (
                                <th key={field.name} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {field.label}
                                </th>
                            ))}
                            {hasPosts && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Postos
                                </th>
                            )}
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                {fields.map(field => (
                                    <td key={field.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item[field.name]}
                                    </td>
                                ))}
                                {hasPosts && (
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {item.posts && item.posts.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {item.posts.map((p, i) => (
                                                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                        {p}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">Nenhum</span>
                                        )}
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {canEdit && (
                                        <button
                                            onClick={() => handleStartEdit(item)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                            title="Editar"
                                        >
                                            <Edit size={18} />
                                        </button>
                                    )}
                                    {canDelete && (
                                        <button
                                            onClick={() => onDelete(item.id)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Excluir"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={fields.length + (hasPosts ? 2 : 1)} className="px-6 py-4 text-center text-gray-500">
                                    Nenhum registro encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function UserRegistrySection({ users, onAdd, onUpdate, onDelete }) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'user',
        permissions: {
            registries: { create: false, edit: false, delete: false },
            workLogs: { create: false, edit: false, delete: false }
        }
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleStartAdd = () => {
        setFormData({
            username: '',
            password: '',
            role: 'user',
            permissions: {
                registries: { create: false, edit: false, delete: false },
                workLogs: { create: false, edit: false, delete: false }
            }
        });
        setIsAdding(true);
        setEditingId(null);
    };

    const handleStartEdit = (user) => {
        const perms = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
        setFormData({
            username: user.username,
            password: '', // Don't show password
            role: user.role,
            permissions: perms || {
                registries: { create: false, edit: false, delete: false },
                workLogs: { create: false, edit: false, delete: false }
            }
        });
        setEditingId(user.id);
        setIsAdding(false);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isAdding) {
                await onAdd(formData);
            } else if (editingId) {
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password;
                await onUpdate(editingId, updateData);
            }
            handleCancel();
        } catch (error) {
            console.error("Error saving user:", error);
        }
    };

    const handlePermissionChange = (category, action) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [category]: {
                    ...prev.permissions[category],
                    [action]: !prev.permissions[category][action]
                }
            }
        }));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Usuários</h2>
                {!isAdding && !editingId && (
                    <button
                        onClick={handleStartAdd}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={18} />
                        <span>Adicionar Usuário</span>
                    </button>
                )}
            </div>

            {(isAdding || editingId) && (
                <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Senha {editingId && '(deixe em branco para manter)'}</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    required={isAdding}
                                    minLength={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
                            <select
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="user">Usuário</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                    </div>

                    {formData.role !== 'admin' && (
                        <div className="mb-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Permissões</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-3 rounded border">
                                    <p className="font-medium mb-2">Cadastros</p>
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.permissions.registries.create}
                                                onChange={() => handlePermissionChange('registries', 'create')}
                                            />
                                            <span>Incluir</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.permissions.registries.edit}
                                                onChange={() => handlePermissionChange('registries', 'edit')}
                                            />
                                            <span>Editar</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.permissions.registries.delete}
                                                onChange={() => handlePermissionChange('registries', 'delete')}
                                            />
                                            <span>Excluir</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="bg-white p-3 rounded border">
                                    <p className="font-medium mb-2">Lançamentos</p>
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.permissions.workLogs.create}
                                                onChange={() => handlePermissionChange('workLogs', 'create')}
                                            />
                                            <span>Incluir</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.permissions.workLogs.edit}
                                                onChange={() => handlePermissionChange('workLogs', 'edit')}
                                            />
                                            <span>Editar</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.permissions.workLogs.delete}
                                                onChange={() => handlePermissionChange('workLogs', 'delete')}
                                            />
                                            <span>Excluir</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                        <button type="button" onClick={handleCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-md">Cancelar</button>
                        <button type="submit" className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                            <Save size={18} /> <span>Salvar</span>
                        </button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.role === 'admin' ? 'Administrador' : 'Usuário'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleStartEdit(u)} className="text-blue-600 hover:text-blue-900 mr-4"><Edit size={18} /></button>
                                    <button onClick={() => onDelete(u.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
