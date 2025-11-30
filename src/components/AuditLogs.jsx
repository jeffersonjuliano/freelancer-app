import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import { Search, Filter, Calendar } from 'lucide-react';

export default function AuditLogs() {
    const { data: logs, loading, error } = useData('audit-logs', []);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('all');

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.entity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesAction = filterAction === 'all' || log.action === filterAction;

        return matchesSearch && matchesAction;
    });

    if (loading) return <div className="p-8 text-center">Carregando auditoria...</div>;
    if (error) return <div className="p-8 text-center text-red-600">Erro ao carregar auditoria: {error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Calendar className="text-blue-600" />
                    Logs de Auditoria
                </h2>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por usuário, entidade..."
                            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        className="p-2 border rounded-lg bg-gray-50"
                        value={filterAction}
                        onChange={e => setFilterAction(e.target.value)}
                    >
                        <option value="all">Todas Ações</option>
                        <option value="CREATE">Criação</option>
                        <option value="UPDATE">Atualização</option>
                        <option value="DELETE">Exclusão</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Data/Hora</th>
                                <th className="p-4 font-semibold text-gray-600">Usuário</th>
                                <th className="p-4 font-semibold text-gray-600">Ação</th>
                                <th className="p-4 font-semibold text-gray-600">Entidade</th>
                                <th className="p-4 font-semibold text-gray-600">ID</th>
                                <th className="p-4 font-semibold text-gray-600">Detalhes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLogs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-500 whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                                    </td>
                                    <td className="p-4 font-medium text-gray-800">
                                        {log.username || 'Sistema'}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                                                log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-700">{log.entity}</td>
                                    <td className="p-4 text-gray-500 font-mono text-xs">{log.entity_id}</td>
                                    <td className="p-4 text-gray-600 max-w-xs truncate" title={log.details}>
                                        {log.details}
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
