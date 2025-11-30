import React, { useMemo } from 'react';
import { Download, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { formatCurrency, formatDate } from '../lib/utils';
import { FilterBar } from './FilterBar';

export function Reports({
    workLogs,
    filters,
    setFilters,
    employees,
    clients,
    services,
    myCompanies,
    coverageReasons
}) {
    const filteredLogs = useMemo(() => {
        return workLogs.filter(log => {
            const matchesDate = (!filters.startDate || log.date >= filters.startDate) &&
                (!filters.endDate || log.date <= filters.endDate);
            const matchesClient = !filters.clientId || log.clientId === filters.clientId;
            const matchesEmployee = !filters.employeeId || log.employeeId === filters.employeeId;
            const matchesStatus = filters.status === 'all' || (log.status || 'pending') === filters.status;
            const matchesCoverageReason = !filters.coverageReasonId || log.coverageReasonId == filters.coverageReasonId;
            return matchesDate && matchesClient && matchesEmployee && matchesStatus && matchesCoverageReason;
        });
    }, [workLogs, filters]);

    const totals = useMemo(() => {
        return filteredLogs.reduce((acc, log) => {
            const val = Number(log.value) || 0;
            acc.total += val;
            if (log.status === 'paid') acc.paid += val;
            else acc.pending += val;
            return acc;
        }, { total: 0, paid: 0, pending: 0 });
    }, [filteredLogs]);

    const exportToCSV = () => {
        const headers = ['Data', 'Empresa', 'Cliente', 'Posto', 'Colaborador', 'Serviço', 'Valor', 'Status', 'Motivo Cobertura', 'Obs'];
        const data = filteredLogs.map(log => {
            const company = myCompanies.find(c => c.id == log.companyId)?.name || '';
            const client = clients.find(c => c.id == log.clientId)?.name || '';
            const employee = employees.find(e => e.id == log.employeeId)?.name || '';
            const service = services.find(s => s.id == log.serviceId)?.name || '';
            const status = log.status === 'paid' ? 'Pago' : 'Pendente';
            const coverageReason = coverageReasons.find(r => r.id == log.coverageReasonId)?.name || '';

            return [
                log.date,
                company,
                client,
                log.postName || '',
                employee,
                service,
                Number(log.value).toFixed(2),
                status,
                coverageReason,
                log.obs || ''
            ].map(field => `"${field}"`).join(',');
        });

        const csvContent = [headers.join(','), ...data].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `relatorio_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Relatórios</h1>
                <button
                    onClick={exportToCSV}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Download size={20} />
                    <span>Exportar CSV</span>
                </button>
            </div>

            <FilterBar
                filters={filters}
                setFilters={setFilters}
                clients={clients}
                employees={employees}
                coverageReasons={coverageReasons}
            />

            {/* Totals Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-blue-600">Total Geral</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">{formatCurrency(totals.total)}</p>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-green-600">Total Pago</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(totals.paid)}</p>
                    </CardContent>
                </Card>
                <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-yellow-600">Total Pendente</p>
                        <p className="text-2xl font-bold text-yellow-900 mt-1">{formatCurrency(totals.pending)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        Detalhamento
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-gray-500 border-b border-gray-100">
                                    <th className="py-3 font-medium">Data</th>
                                    <th className="py-3 font-medium">Cliente</th>
                                    <th className="py-3 font-medium">Posto</th>
                                    <th className="py-3 font-medium">Colaborador</th>
                                    <th className="py-3 font-medium">Serviço</th>
                                    <th className="py-3 font-medium">Motivo</th>
                                    <th className="py-3 font-medium text-right">Valor</th>
                                    <th className="py-3 font-medium text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredLogs.map(log => {
                                    const emp = employees.find(e => e.id == log.employeeId);
                                    const cli = clients.find(c => c.id == log.clientId);
                                    const srv = services.find(s => s.id == log.serviceId);
                                    const isPaid = log.status === 'paid';

                                    return (
                                        <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3 text-gray-600">{formatDate(log.date)}</td>
                                            <td className="py-3 text-gray-900 font-medium">{cli?.name || 'N/A'}</td>
                                            <td className="py-3 text-gray-600">{log.postName || '-'}</td>
                                            <td className="py-3 text-gray-600">{emp?.name || 'N/A'}</td>
                                            <td className="py-3 text-gray-600">{srv?.name || 'N/A'}</td>
                                            <td className="py-3 text-gray-600">{coverageReasons.find(r => r.id == log.coverageReasonId)?.name || '-'}</td>
                                            <td className="py-3 text-right font-semibold text-gray-900">
                                                {formatCurrency(log.value)}
                                            </td>
                                            <td className="py-3 text-center">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {isPaid ? 'Pago' : 'Pendente'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredLogs.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="py-8 text-center text-gray-500">
                                            Nenhum registro encontrado para os filtros selecionados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
