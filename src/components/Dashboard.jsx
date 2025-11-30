import React, { useMemo, useState } from 'react';
import { DollarSign, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { formatCurrency } from '../lib/utils';
import { FilterBar } from './FilterBar';

export function Dashboard({ workLogs, employees, clients, coverageReasons }) {
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        clientId: '',
        employeeId: '',
        status: 'all',
        coverageReasonId: ''
    });

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

    const recentActivity = filteredLogs
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <div className="text-sm text-gray-500">
                    Última atualização: {new Date().toLocaleTimeString()}
                </div>
            </div>

            <FilterBar
                filters={filters}
                setFilters={setFilters}
                clients={clients}
                employees={employees}
                coverageReasons={coverageReasons}
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard
                    title="Total Recebido"
                    value={formatCurrency(totals.paid)}
                    icon={CheckCircle}
                    color="green"
                    trend="+12% vs mês anterior"
                />
                <SummaryCard
                    title="Pendente"
                    value={formatCurrency(totals.pending)}
                    icon={Clock}
                    color="yellow"
                    trend="5 faturas pendentes"
                />
                <SummaryCard
                    title="Total Geral"
                    value={formatCurrency(totals.total)}
                    icon={DollarSign}
                    color="blue"
                    trend="Baseado nos filtros atuais"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-gray-500" />
                            Atividade Recente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.map(log => {
                                const emp = employees.find(e => e.id === log.employeeId);
                                const cli = clients.find(c => c.id === log.clientId);
                                return (
                                    <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-full ${log.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                {log.status === 'paid' ? <CheckCircle size={20} /> : <Clock size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{emp?.name || 'N/A'}</p>
                                                <p className="text-sm text-gray-500">{cli?.name || 'N/A'} • {new Date(log.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className="font-semibold text-gray-900">{formatCurrency(log.value)}</span>
                                    </div>
                                );
                            })}
                            {recentActivity.length === 0 && (
                                <p className="text-center text-gray-500 py-4">Nenhuma atividade recente.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-gray-500" />
                            Status Geral
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Pago</span>
                                    <span className="font-medium text-gray-900">{((totals.paid / (totals.total || 1)) * 100).toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(totals.paid / (totals.total || 1)) * 100}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Pendente</span>
                                    <span className="font-medium text-gray-900">{((totals.pending / (totals.total || 1)) * 100).toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${(totals.pending / (totals.total || 1)) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function SummaryCard({ title, value, icon: Icon, color, trend }) {
    const colorClasses = {
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        purple: 'bg-purple-100 text-purple-600'
    };

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                        <Icon size={24} />
                    </div>
                    <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${colorClasses[color]} bg-opacity-20`}>
                        {trend}
                    </span>
                </div>
                <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            </CardContent>
        </Card>
    );
}
