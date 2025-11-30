import React from 'react';
import { Filter } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Input, Select } from './ui/Input';

export function FilterBar({ filters, setFilters, clients, employees, coverageReasons }) {
    return (
        <Card className="print:hidden mb-6">
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4 text-gray-500 font-medium">
                    <Filter size={18} /> Filtros
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Input
                        label="Início"
                        type="date"
                        value={filters.startDate}
                        onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                    />
                    <Input
                        label="Fim"
                        type="date"
                        value={filters.endDate}
                        onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                    />
                    <Select
                        label="Cliente"
                        value={filters.clientId}
                        onChange={e => setFilters({ ...filters, clientId: e.target.value })}
                    >
                        <option value="">Todos</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>
                    <Select
                        label="Colaborador"
                        value={filters.employeeId}
                        onChange={e => setFilters({ ...filters, employeeId: e.target.value })}
                    >
                        <option value="">Todos</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </Select>
                    <Select
                        label="Status"
                        value={filters.status}
                        onChange={e => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="all">Todos</option>
                        <option value="pending">Pendentes</option>
                        <option value="paid">Pagos</option>
                    </Select>
                    <Select
                        label="Motivo da Cobertura"
                        value={filters.coverageReasonId || ''}
                        onChange={e => setFilters({ ...filters, coverageReasonId: e.target.value })}
                    >
                        <option value="">Todos</option>
                        {coverageReasons && coverageReasons.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}
