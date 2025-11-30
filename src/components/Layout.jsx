import React, { useState } from 'react';
import { Briefcase, LayoutDashboard, FileText, Database, ShieldCheck, LogOut, ClipboardList, Key } from 'lucide-react';
import { clsx } from 'clsx';
import logo from '../assets/logo.jpg';

export function Layout({ children, activeTab, setActiveTab, user, onLogout }) {
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'work-logs', label: 'Lançamentos', icon: ClipboardList },
        { id: 'registries', label: 'Cadastros', icon: Database },
        { id: 'reports', label: 'Relatórios', icon: FileText },
        ...(user?.role === 'admin' ? [{ id: 'audit-logs', label: 'Auditoria', icon: ShieldCheck }] : []),
    ];

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (newPassword.length < 6) {
            setPasswordError('A senha deve ter no mínimo 6 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('As senhas não conferem');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/users/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password: newPassword })
            });

            if (response.ok) {
                setPasswordSuccess('Senha alterada com sucesso!');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => setIsChangePasswordOpen(false), 2000);
            } else {
                const data = await response.json();
                setPasswordError(data.error || 'Erro ao alterar senha');
            }
        } catch (error) {
            setPasswordError('Erro de conexão');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-6 border-b border-gray-200 flex flex-col items-center">
                    <img src={logo} alt="Grupo Mave" className="h-24 w-auto mb-4 object-contain" />
                    <div className="flex items-center space-x-2 text-blue-900">
                        <span className="text-lg font-bold text-center leading-tight">Grupo Mave<br /><span className="text-sm font-normal text-gray-600">Segurança e Serviços</span></span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                                    activeTab === tab.id
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                )}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <div className="mb-4 px-4">
                        <p className="text-sm text-gray-500">Logado como</p>
                        <p className="font-medium text-gray-900 truncate">{user?.username || 'Usuário'}</p>
                    </div>
                    <button
                        onClick={() => setIsChangePasswordOpen(true)}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors mb-2"
                    >
                        <Key size={20} />
                        <span className="font-medium">Alterar Senha</span>
                    </button>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>

            {/* Change Password Modal */}
            {isChangePasswordOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Alterar Senha</h2>
                        {passwordError && <div className="bg-red-50 text-red-600 p-2 rounded mb-4 text-sm">{passwordError}</div>}
                        {passwordSuccess && <div className="bg-green-50 text-green-600 p-2 rounded mb-4 text-sm">{passwordSuccess}</div>}
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsChangePasswordOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-md"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
