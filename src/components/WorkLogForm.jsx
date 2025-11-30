import React, { useState } from 'react';
import { Plus, Calendar, Building2, User, MapPin, Briefcase, DollarSign, Clock, FileText, Trash2, Edit, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input, Select } from './ui/Input';
import { formatCurrency, formatDate } from '../lib/utils';
import { FilterBar } from './FilterBar';

export function WorkLogForm({
    companies,
    employees,
    services,
    clients,
    onAddLog,
    workLogs,
    onUpdateLog,
    onDeleteLog,
    coverageReasons,
    user
}) {
    const initialFormState = {
        date: new Date().toISOString().split('T')[0],
        companyId: '',
        clientId: '',
        postName: '',
        originClientId: '',
        originPostName: '',
        serviceId: '',
        value: '',
        employeeId: '',
        startTime: '',
        endTime: '',
        obs: '',
        coverageReasonId: '',
        status: 'pending' // pending, paid
    };

    const [form, setForm] = useState(initialFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        clientId: '',
        employeeId: '',
        status: 'all'
    });

    const checkPermission = (action) => {
        if (user?.role === 'admin') return true;
        try {
            const perms = typeof user?.permissions === 'string' ? JSON.parse(user.permissions) : user?.permissions;
            return perms?.workLogs?.[action] === true;
        } catch (e) {
            return false;
        }
    };

    const canCreate = checkPermission('create');
    const canEdit = checkPermission('edit');
    const canDelete = checkPermission('delete');

    const handleSubmit = () => {
        const payload = {
            ...form,
            value: parseFloat(form.value) || 0
        };

        if (isEditing) {
            onUpdateLog(editingId, payload);
            setIsEditing(false);
            setEditingId(null);
        } else {
            onAddLog(payload);
        }
        setForm(initialFormState);
    };

    const handleEdit = (log) => {
        setForm(log);
        setIsEditing(true);
        setEditingId(log.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
            onDeleteLog(id);
        }
    };

    const handleApprove = async (log) => {
        if (window.confirm('Confirmar pagamento deste lançamento?')) {
            try {
                await onUpdateLog(log.id, { ...log, status: 'paid' });
            } catch (error) {
                console.error("Failed to approve log:", error);
                alert(`Erro ao aprovar pagamento: ${error.message}`);
            }
        }
    };

    const handleServiceSelect = (serviceId) => {
        const service = services.find(s => s.id === serviceId);
        setForm({
            ...form,
            serviceId,
            value: service ? service.defaultValue : ''
        });
    };

    const filteredLogs = workLogs.filter(log => {
        const matchesDate = (!filters.startDate || log.date >= filters.startDate) &&
            (!filters.endDate || log.date <= filters.endDate);
        const matchesClient = !filters.clientId || log.clientId === filters.clientId;
        const matchesEmployee = !filters.employeeId || log.employeeId === filters.employeeId;
        const matchesStatus = filters.status === 'all' || (log.status || 'pending') === filters.status;
        return matchesDate && matchesClient && matchesEmployee && matchesStatus;
    });

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {canCreate && (
                <Card className="border-t-4 border-t-blue-600 shadow-lg">
                    <CardHeader className="border-b border-gray-100 pb-6">
                        <CardTitle className="flex items-center gap-3 text-2xl text-gray-800">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                <Plus size={28} />
                            </div>
                            {isEditing ? 'Editar Lançamento' : 'Novo Lançamento'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-6">

                        {/* Section 1: Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Data"
                                type="date"
                                value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                            />
                            <Select
                                label="Minha Empresa (Prestadora)"
                                value={form.companyId}
                                onChange={e => setForm({ ...form, companyId: e.target.value })}
                            >
                                <option value="">Selecione...</option>
                                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Select>
                        </div>

                        {/* Section 2: Client & Post */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Select
                                label="Cliente"
                                value={form.clientId}
                                onChange={e => setForm({ ...form, clientId: e.target.value, postName: '' })}
                            >
                                <option value="">Selecione...</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Select>
                            <Select
                                label="Posto de Trabalho"
                                value={form.postName}
                                onChange={e => setForm({ ...form, postName: e.target.value })}
                                disabled={!form.clientId}
                            >
                                <option value="">Selecione o Posto...</option>
                                {form.clientId && clients.find(c => c.id == form.clientId)?.posts?.map((p, idx) => (
                                    <option key={idx} value={p}>{p}</option>
                                ))}
                            </Select>
                        </div>

                        {/* Section 2.5: Origin Client & Post (Optional) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <Select
                                label="Cliente de Origem (Opcional)"
                                value={form.originClientId || ''}
                                onChange={e => setForm({ ...form, originClientId: e.target.value, originPostName: '' })}
                            >
                                <option value="">Selecione...</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Select>
                            <Select
                                label="Posto de Origem (Opcional)"
                                value={form.originPostName || ''}
                                onChange={e => setForm({ ...form, originPostName: e.target.value })}
                                disabled={!form.originClientId}
                            >
                                <option value="">Selecione o Posto...</option>
                                {form.originClientId && clients.find(c => c.id == form.originClientId)?.posts?.map((p, idx) => (
                                    <option key={idx} value={p}>{p}</option>
                                ))}
                            </Select>
                        </div>

                        {/* Section 3: Service & Value */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Select
                                label="Serviço"
                                value={form.serviceId}
                                onChange={e => handleServiceSelect(e.target.value)}
                            >
                                <option value="">Selecione...</option>
                                {services.map(s => <option key={s.id} value={s.id}>{s.name} ({formatCurrency(s.defaultValue)})</option>)}
                            </Select>
                            <div className="relative">
                                <Input
                                    label="Valor a Pagar (R$)"
                                    type="number"
                                    step="0.01"
                                    value={form.value}
                                    onChange={e => setForm({ ...form, value: e.target.value })}
                                    className="font-bold text-green-700 bg-green-50 border-green-200 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                        </div>

                        {/* Section 4: Employee */}
                        <Select
                            label="Colaborador"
                            value={form.employeeId}
                            onChange={e => setForm({ ...form, employeeId: e.target.value })}
                        >
                            <option value="">Selecione...</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({(e.role || '').toUpperCase()})</option>)}
                        </Select>

                        {/* Section 5: Time & Obs */}
                        <div className="grid grid-cols-2 gap-6">
                            <Input
                                label="Entrada"
                                type="time"
                                value={form.startTime}
                                onChange={e => setForm({ ...form, startTime: e.target.value })}
                            />
                            <Input
                                label="Saída"
                                type="time"
                                value={form.endTime}
                                onChange={e => setForm({ ...form, endTime: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Observação</label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                rows="3"
                                value={form.obs}
                                onChange={e => setForm({ ...form, obs: e.target.value })}
                                placeholder="Ex: Feriado, Cobertura, etc."
                            />
                        </div>

                        <Select
                            label="Motivo da Cobertura"
                            value={form.coverageReasonId}
                            onChange={e => setForm({ ...form, coverageReasonId: e.target.value })}
                        >
                            <option value="">Selecione (Opcional)...</option>
                            {coverageReasons && coverageReasons.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </Select>

                        <div className="flex gap-4">
                            <Button onClick={handleSubmit} size="lg" className="flex-1 shadow-md">
                                {isEditing ? 'Atualizar Lançamento' : 'Registrar Lançamento'}
                            </Button>
                            {isEditing && (
                                <Button variant="outline" onClick={() => {
                                    setIsEditing(false);
                                    setEditingId(null);
                                    setForm(initialFormState);
                                }}>
                                    Cancelar
                                </Button>
                            )}
                        </div>

                    </CardContent>
                </Card>
            )}

            {/* List Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-6 w-6" />
                        Histórico de Lançamentos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <FilterBar
                        filters={filters}
                        setFilters={setFilters}
                        clients={clients}
                        employees={employees}
                    />

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-gray-500 border-b border-gray-100">
                                    <th className="py-3 font-medium">Data</th>
                                    <th className="py-3 font-medium">Colaborador</th>
                                    <th className="py-3 font-medium">Cliente</th>
                                    <th className="py-3 font-medium">Serviço</th>
                                    <th className="py-3 font-medium text-right">Valor</th>
                                    <th className="py-3 font-medium text-center">Status</th>
                                    <th className="py-3 font-medium text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredLogs.map(log => {
                                    const emp = employees.find(e => e.id === log.employeeId);
                                    const cli = clients.find(c => c.id === log.clientId);
                                    const srv = services.find(s => s.id === log.serviceId);
                                    const isPaid = log.status === 'paid';

                                    return (
                                        <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3 text-gray-600">{formatDate(log.date)}</td>
                                            <td className="py-3 font-medium text-gray-900">{emp?.name || 'N/A'}</td>
                                            <td className="py-3 text-gray-600">{cli?.name || 'N/A'}</td>
                                            <td className="py-3 text-gray-600">{srv?.name || 'N/A'}</td>
                                            <td className="py-3 text-right font-semibold text-gray-900">
                                                {formatCurrency(log.value)}
                                            </td>
                                            <td className="py-3 text-center">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {isPaid ? 'Pago' : 'Pendente'}
                                                </span>
                                            </td>
                                            <td className="py-3 text-center flex justify-center gap-2">
                                                {!isPaid && canEdit && (
                                                    <button
                                                        onClick={() => handleApprove(log)}
                                                        className="text-green-600 hover:text-green-800"
                                                        title="Aprovar Pagamento"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                                {canEdit && (
                                                    <button onClick={() => handleEdit(log)} className="text-blue-600 hover:text-blue-800" title="Editar">
                                                        <Edit size={18} />
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button onClick={() => handleDelete(log.id)} className="text-red-600 hover:text-red-800" title="Excluir">
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredLogs.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="py-8 text-center text-gray-500">
                                            Nenhum lançamento encontrado.
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
