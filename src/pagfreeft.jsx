import React, { useState, useEffect, useMemo } from 'react';
import {
    Users, Building2, Briefcase, MapPin, Calendar,
    DollarSign, FileText, Plus, Trash2,
    Download, Printer, CheckCircle,
    TrendingUp, AlertCircle
} from 'lucide-react';

// --- Utility Functions ---

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Main Application Component ---

export default function App() {
    // --- State Management (Data) ---
    const [activeTab, setActiveTab] = useState('dashboard');

    // Entities
    const [myCompanies, setMyCompanies] = useState(() => JSON.parse(localStorage.getItem('myCompanies')) || []);
    const [employees, setEmployees] = useState(() => JSON.parse(localStorage.getItem('employees')) || []);
    const [services, setServices] = useState(() => JSON.parse(localStorage.getItem('services')) || []);
    const [clients, setClients] = useState(() => JSON.parse(localStorage.getItem('clients')) || []);
    const [workLogs, setWorkLogs] = useState(() => JSON.parse(localStorage.getItem('workLogs')) || []);

    // UI State for Forms
    const [newCompany, setNewCompany] = useState('');
    const [newEmployee, setNewEmployee] = useState({ name: '', type: 'freelancer' }); // type: freelancer | clt
    const [newService, setNewService] = useState({ name: '', defaultValue: '' });
    const [newClient, setNewClient] = useState({ name: '', tempPost: '', posts: [] });

    const [logForm, setLogForm] = useState({
        date: new Date().toISOString().split('T')[0],
        companyId: '',
        clientId: '',
        postName: '',
        serviceId: '',
        employeeId: '',
        startTime: '08:00',
        endTime: '18:00',
        value: '',
        status: 'pending', // pending | paid
        obs: ''
    });

    // Filters
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        clientId: '',
        employeeId: '',
        status: 'all'
    });

    // --- Effects (Persistence) ---
    useEffect(() => localStorage.setItem('myCompanies', JSON.stringify(myCompanies)), [myCompanies]);
    useEffect(() => localStorage.setItem('employees', JSON.stringify(employees)), [employees]);
    useEffect(() => localStorage.setItem('services', JSON.stringify(services)), [services]);
    useEffect(() => localStorage.setItem('clients', JSON.stringify(clients)), [clients]);
    useEffect(() => localStorage.setItem('workLogs', JSON.stringify(workLogs)), [workLogs]);

    // --- Handlers: Registration ---

    const addCompany = () => {
        if (!newCompany.trim()) return;
        setMyCompanies([...myCompanies, { id: generateId(), name: newCompany }]);
        setNewCompany('');
    };

    const deleteEntity = (setter, list, id) => {
        if (confirm('Tem certeza que deseja excluir?')) {
            setter(list.filter(item => item.id !== id));
        }
    };

    const addEmployee = () => {
        if (!newEmployee.name.trim()) return;
        setEmployees([...employees, { id: generateId(), ...newEmployee }]);
        setNewEmployee({ name: '', type: 'freelancer' });
    };

    const addService = () => {
        if (!newService.name.trim() || !newService.defaultValue) return;
        setServices([...services, { id: generateId(), ...newService, defaultValue: parseFloat(newService.defaultValue) }]);
        setNewService({ name: '', defaultValue: '' });
    };

    const addPostToClientTemp = () => {
        if (!newClient.tempPost.trim()) return;
        setNewClient({ ...newClient, posts: [...newClient.posts, newClient.tempPost], tempPost: '' });
    };

    const addClient = () => {
        if (!newClient.name.trim()) return;
        setClients([...clients, { id: generateId(), name: newClient.name, posts: newClient.posts }]);
        setNewClient({ name: '', tempPost: '', posts: [] });
    };

    // --- Handlers: Work Logs ---

    const handleServiceSelect = (serviceId) => {
        const service = services.find(s => s.id === serviceId);
        setLogForm({
            ...logForm,
            serviceId,
            value: service ? service.defaultValue : ''
        });
    };

    const addWorkLog = () => {
        if (!logForm.companyId || !logForm.clientId || !logForm.employeeId || !logForm.serviceId || !logForm.value) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }
        setWorkLogs([...workLogs, { id: generateId(), ...logForm, value: parseFloat(logForm.value) }]);
        // Reset form mostly, keep date
        setLogForm({ ...logForm, serviceId: '', employeeId: '', value: '', obs: '', clientId: '', postName: '' });
        alert('Lançamento registrado com sucesso!');
    };

    const togglePaymentStatus = (id) => {
        setWorkLogs(workLogs.map(log =>
            log.id === id ? { ...log, status: log.status === 'paid' ? 'pending' : 'paid' } : log
        ));
    };

    // --- Derived Data & Reports ---

    const filteredLogs = useMemo(() => {
        return workLogs.filter(log => {
            const dateMatch = (!filters.startDate || log.date >= filters.startDate) &&
                (!filters.endDate || log.date <= filters.endDate);
            const clientMatch = !filters.clientId || log.clientId === filters.clientId;
            const empMatch = !filters.employeeId || log.employeeId === filters.employeeId;
            const statusMatch = filters.status === 'all' || log.status === filters.status;
            return dateMatch && clientMatch && empMatch && statusMatch;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [workLogs, filters]);

    const totals = useMemo(() => {
        return filteredLogs.reduce((acc, log) => {
            acc.total += log.value;
            if (log.status === 'paid') acc.paid += log.value;
            else acc.pending += log.value;
            return acc;
        }, { total: 0, paid: 0, pending: 0 });
    }, [filteredLogs]);

    // --- Export Functions ---

    const exportToCSV = () => {
        const headers = "Data;Empresa;Cliente;Posto;Colaborador;Tipo;Serviço;Entrada;Saída;Valor;Status;Obs\n";
        const rows = filteredLogs.map(log => {
            const company = myCompanies.find(c => c.id === log.companyId)?.name || 'N/A';
            const client = clients.find(c => c.id === log.clientId)?.name || 'N/A';
            const employee = employees.find(e => e.id === log.employeeId);
            const service = services.find(s => s.id === log.serviceId)?.name || 'N/A';
            const status = log.status === 'paid' ? 'Pago' : 'Pendente';

            return `${formatDate(log.date)};${company};${client};${log.postName};${employee?.name};${employee?.type};${service};${log.startTime};${log.endTime};${log.value.toFixed(2).replace('.', ',')};${status};${log.obs}`;
        }).join("\n");

        const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "relatorio_pagamentos.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
            <header className="bg-white shadow-sm print:hidden">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-8 w-8 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Gestão de Freelancers</h1>
                    </div>
                    <div className="text-sm text-gray-500">
                        v1.0
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto">
                    <TabButton id="dashboard" label="Visão Geral" icon={TrendingUp} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="entries" label="Lançar Trabalho" icon={Plus} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="reports" label="Relatórios/Pagamentos" icon={FileText} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="registries" label="Cadastros" icon={DatabaseIcon} activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">

                {/* DASHBOARD VIEW */}
                {
                    activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <DashboardCard
                                    title="Total Pendente"
                                    value={totals.pending}
                                    icon={AlertCircle}
                                    color="text-orange-600"
                                    bgColor="bg-orange-100"
                                />
                                <DashboardCard
                                    title="Total Pago"
                                    value={totals.paid}
                                    icon={CheckCircle}
                                    color="text-green-600"
                                    bgColor="bg-green-100"
                                />
                                <DashboardCard
                                    title="Total Geral (Período)"
                                    value={totals.total}
                                    icon={DollarSign}
                                    color="text-blue-600"
                                    bgColor="bg-blue-100"
                                />
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Resumo Recente
                                </h3>
                                {
                                    workLogs.length === 0 ? (
                                        <p className="text-gray-500"> Nenhum lançamento encontrado.</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead>
                                                    <tr className="border-b bg-gray-50">
                                                        <th className="p-3"> Data </th>
                                                        <th className="p-3"> Colaborador </th>
                                                        <th className="p-3"> Cliente </th>
                                                        <th className="p-3"> Valor </th>
                                                        <th className="p-3"> Status </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        workLogs.slice(-5).reverse().map(log => {
                                                            const emp = employees.find(e => e.id === log.employeeId);
                                                            const cli = clients.find(c => c.id === log.clientId);
                                                            return (
                                                                <tr key={log.id} className="border-b">
                                                                    <td className="p-3"> {formatDate(log.date)
                                                                    } </td>
                                                                    <td className="p-3 font-medium"> {emp?.name} </td>
                                                                    <td className="p-3"> {cli?.name} </td>
                                                                    <td className="p-3 font-bold text-gray-700"> {formatCurrency(log.value)} </td>
                                                                    <td className="p-3">
                                                                        <span className={
                                                                            `px-2 py-1 rounded-full text-xs font-bold ${log.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                                            }`
                                                                        }>
                                                                            {log.status === 'paid' ? 'PAGO' : 'PENDENTE'}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                            </div>
                        </div>
                    )
                }

                {/* REGISTRIES VIEW */}
                {
                    activeTab === 'registries' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Minhas Empresas */}
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"> <Building2 size={20} /> Minhas Empresas</h3>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Nome da Empresa Prestadora"
                                        className="flex-1 p-2 border rounded"
                                        value={newCompany}
                                        onChange={(e) => setNewCompany(e.target.value)
                                        }
                                    />
                                    <button onClick={addCompany} className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"> Add </button>
                                </div>
                                <ul className="space-y-2">
                                    {
                                        myCompanies.map(c => (
                                            <ListItem key={c.id} text={c.name} onDelete={() => deleteEntity(setMyCompanies, myCompanies, c.id)} />
                                        ))}
                                </ul>
                            </div>

                            {/* Serviços */}
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"> <Briefcase size={20} /> Serviços & Valores</h3>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Nome do Serviço (ex: Vigilante)"
                                        className="flex-1 p-2 border rounded"
                                        value={newService.name}
                                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Valor Padrão (R$)"
                                        className="w-32 p-2 border rounded"
                                        value={newService.defaultValue}
                                        onChange={(e) => setNewService({ ...newService, defaultValue: e.target.value })}
                                    />
                                    <button onClick={addService} className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"> Add </button>
                                </div>
                                <ul className="space-y-2">
                                    {
                                        services.map(s => (
                                            <ListItem key={s.id} text={`${s.name} - ${formatCurrency(s.defaultValue)}`} onDelete={() => deleteEntity(setServices, services, s.id)} />
                                        ))}
                                </ul>
                            </div>

                            {/* Colaboradores */}
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"> <Users size={20} /> Colaboradores</h3>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Nome Completo"
                                        className="flex-1 p-2 border rounded"
                                        value={newEmployee.name}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                                    />
                                    <select
                                        className="p-2 border rounded"
                                        value={newEmployee.type}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, type: e.target.value })}
                                    >
                                        <option value="freelancer"> Freelancer </option>
                                        <option value="clt"> CLT(Folga Trab.) </option>
                                    </select>
                                    <button onClick={addEmployee} className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"> Add </button>
                                </div>
                                <ul className="space-y-2 max-h-60 overflow-y-auto">
                                    {
                                        employees.map(e => (
                                            <ListItem key={e.id} text={`${e.name} (${e.type === 'clt' ? 'Funcionário' : 'Freelancer'})`} onDelete={() => deleteEntity(setEmployees, employees, e.id)} />
                                        ))}
                                </ul>
                            </div>

                            {/* Clientes e Postos */}
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"> <MapPin size={20} /> Clientes & Postos</h3>
                                <div className="space-y-3 mb-4 bg-gray-50 p-4 rounded border">
                                    <input
                                        type="text"
                                        placeholder="Nome do Cliente"
                                        className="w-full p-2 border rounded"
                                        value={newClient.name}
                                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Adicionar Posto (ex: Portaria 1)"
                                            className="flex-1 p-2 border rounded text-sm"
                                            value={newClient.tempPost}
                                            onChange={(e) => setNewClient({ ...newClient, tempPost: e.target.value })}
                                        />
                                        <button onClick={addPostToClientTemp} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 rounded text-sm font-bold"> +</button>
                                    </div>
                                    {
                                        newClient.posts.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {
                                                    newClient.posts.map((p, idx) => (
                                                        <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"> {p} </span>
                                                    ))
                                                }
                                            </div>
                                        )
                                    }
                                    <button onClick={addClient} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"> Salvar Cliente </button>
                                </div>

                                <ul className="space-y-4 max-h-60 overflow-y-auto">
                                    {
                                        clients.map(c => (
                                            <li key={c.id} className="border p-3 rounded bg-white relative group">
                                                <div className="flex justify-between font-bold">
                                                    {c.name}
                                                    <button onClick={() => deleteEntity(setClients, clients, c.id)} className="text-red-400 hover:text-red-600"> <Trash2 size={16} /></button>
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1"> Postos: {c.posts.join(', ') || 'Geral'} </div>
                                            </li>
                                        ))}
                                </ul>
                            </div>

                        </div>
                    )
                }

                {/* WORK LOG ENTRY VIEW */}
                {
                    activeTab === 'entries' && (
                        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg border-t-4 border-blue-600">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                                <Plus className="bg-blue-100 text-blue-600 rounded p-1" size={32} />
                                Novo Lançamento
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <FormGroup label="Data">
                                    <input type="date" className="input-field" value={logForm.date} onChange={e => setLogForm({ ...logForm, date: e.target.value })
                                    } />
                                </FormGroup>

                                <FormGroup label="Minha Empresa (Prestadora)">
                                    <select className="input-field" value={logForm.companyId} onChange={e => setLogForm({ ...logForm, companyId: e.target.value })}>
                                        <option value=""> Selecione...</option>
                                        {myCompanies.map(c => <option key={c.id} value={c.id}> {c.name} </option>)}
                                    </select>
                                </FormGroup>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <FormGroup label="Cliente">
                                    <select className="input-field" value={logForm.clientId} onChange={e => setLogForm({ ...logForm, clientId: e.target.value, postName: '' })}>
                                        <option value=""> Selecione...</option>
                                        {clients.map(c => <option key={c.id} value={c.id}> {c.name} </option>)}
                                    </select>
                                </FormGroup>

                                <FormGroup label="Posto de Trabalho">
                                    <select
                                        className="input-field"
                                        value={logForm.postName}
                                        onChange={e => setLogForm({ ...logForm, postName: e.target.value })}
                                        disabled={!logForm.clientId}
                                    >
                                        <option value=""> Selecione o Posto...</option>
                                        {
                                            logForm.clientId && clients.find(c => c.id === logForm.clientId)?.posts.map((p, idx) => (
                                                <option key={idx} value={p}> {p} </option>
                                            ))
                                        }
                                    </select>
                                </FormGroup>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <FormGroup label="Serviço">
                                    <select className="input-field" value={logForm.serviceId} onChange={e => handleServiceSelect(e.target.value)} >
                                        <option value=""> Selecione...</option>
                                        {services.map(s => <option key={s.id} value={s.id}> {s.name}({formatCurrency(s.defaultValue)})</option>)}
                                    </select>
                                </FormGroup>

                                <FormGroup label="Valor a Pagar (R$)">
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="input-field font-bold text-green-700 bg-green-50"
                                        value={logForm.value}
                                        onChange={e => setLogForm({ ...logForm, value: e.target.value })}
                                    />
                                </FormGroup>
                            </div>

                            <FormGroup label="Colaborador">
                                <select className="input-field" value={logForm.employeeId} onChange={e => setLogForm({ ...logForm, employeeId: e.target.value })}>
                                    <option value=""> Selecione...</option>
                                    {employees.map(e => <option key={e.id} value={e.id}> {e.name}({e.type.toUpperCase()}) </option>)}
                                </select>
                            </FormGroup>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <FormGroup label="Entrada">
                                    <input type="time" className="input-field" value={logForm.startTime} onChange={e => setLogForm({ ...logForm, startTime: e.target.value })} />
                                </FormGroup>
                                <FormGroup label="Saída">
                                    <input type="time" className="input-field" value={logForm.endTime} onChange={e => setLogForm({ ...logForm, endTime: e.target.value })} />
                                </FormGroup>
                            </div>

                            <FormGroup label="Observação">
                                <textarea className="input-field" rows="2" value={logForm.obs} onChange={e => setLogForm({ ...logForm, obs: e.target.value })} placeholder="Ex: Feriado, Cobertura, etc." />
                            </FormGroup>

                            <button onClick={addWorkLog} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 shadow transition-all mt-4">
                                Registrar Lançamento
                            </button>
                        </div>
                    )
                }

                {/* REPORTS VIEW */}
                {
                    activeTab === 'reports' && (
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            {/* Filter Bar */}
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6 p-4 bg-gray-50 rounded border print:hidden">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-500 mb-1"> Início </span>
                                    <input type="date" className="p-2 border rounded text-sm" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })
                                    } />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-500 mb-1"> Fim </span>
                                    <input type="date" className="p-2 border rounded text-sm" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-500 mb-1"> Cliente </span>
                                    <select className="p-2 border rounded text-sm" value={filters.clientId} onChange={e => setFilters({ ...filters, clientId: e.target.value })}>
                                        <option value=""> Todos </option>
                                        {clients.map(c => <option key={c.id} value={c.id}> {c.name} </option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-500 mb-1"> Colaborador </span>
                                    <select className="p-2 border rounded text-sm" value={filters.employeeId} onChange={e => setFilters({ ...filters, employeeId: e.target.value })}>
                                        <option value=""> Todos </option>
                                        {employees.map(e => <option key={e.id} value={e.id}> {e.name} </option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-500 mb-1"> Status </span>
                                    <select className="p-2 border rounded text-sm" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                                        <option value="all"> Todos </option>
                                        <option value="pending"> Pendentes </option>
                                        <option value="paid"> Pagos </option>
                                    </select>
                                </div>
                            </div>

                            {/* Actions Bar */}
                            <div className="flex justify-between items-center mb-4 print:hidden">
                                <div className="text-sm text-gray-500"> Mostrando {filteredLogs.length} registros </div>
                                <div className="flex gap-2">
                                    <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50 text-gray-700">
                                        <Printer size={16} /> Imprimir
                                    </button>
                                    <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                        <Download size={16} /> Excel (CSV)
                                    </button>
                                </div>
                            </div>

                            {/* Report Header for Print */}
                            <div className="hidden print:block mb-6">
                                <h1 className="text-2xl font-bold"> Relatório de Pagamentos </h1>
                                <p> Gerado em: {new Date().toLocaleDateString()} </p>
                                <div className="mt-4 border-t border-b py-2 flex justify-between font-bold">
                                    <span>Total Pago: {formatCurrency(totals.paid)} </span>
                                    <span> Total Pendente: {formatCurrency(totals.pending)} </span>
                                    <span> Total Geral: {formatCurrency(totals.total)} </span>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 border-b-2 border-gray-200">
                                            <th className="p-3"> Data </th>
                                            <th className="p-3"> Colaborador </th>
                                            <th className="p-3"> Cliente / Posto </th>
                                            <th className="p-3"> Serviço </th>
                                            <th className="p-3 text-center"> Horário </th>
                                            <th className="p-3 text-right"> Valor </th>
                                            <th className="p-3 text-center print:hidden"> Ações </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            filteredLogs.map(log => {
                                                const emp = employees.find(e => e.id === log.employeeId);
                                                const cli = clients.find(c => c.id === log.clientId);
                                                const srv = services.find(s => s.id === log.serviceId);

                                                return (
                                                    <tr key={log.id} className={`border-b hover:bg-gray-50 ${log.status === 'paid' ? 'bg-green-50/30' : ''}`
                                                    }>
                                                        <td className="p-3"> {formatDate(log.date)
                                                        } </td>
                                                        <td className="p-3">
                                                            <div className="font-bold text-gray-800"> {emp?.name} </div>
                                                            <div className="text-xs text-gray-500"> {emp?.type === 'clt' ? 'Funcionário' : 'Freelancer'}</div>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="font-medium"> {cli?.name} </div>
                                                            <div className="text-xs text-gray-500"> {log.postName} </div>
                                                        </td>
                                                        <td className="p-3">
                                                            {srv?.name}
                                                            {log.obs && <div className="text-xs text-yellow-600 mt-1 italic"> {log.obs} </div>}
                                                        </td>
                                                        <td className="p-3 text-center text-xs text-gray-500">
                                                            {log.startTime} - {log.endTime}
                                                        </td>
                                                        <td className="p-3 text-right font-bold text-gray-700">
                                                            {formatCurrency(log.value)}
                                                        </td>
                                                        <td className="p-3 text-center print:hidden">
                                                            <button
                                                                onClick={() => togglePaymentStatus(log.id)}
                                                                className={`p-2 rounded transition-colors ${log.status === 'paid'
                                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                                    }`}
                                                                title={log.status === 'paid' ? 'Marcar como Pendente' : 'Marcar como Pago'}
                                                            >
                                                                {log.status === 'paid' ? <CheckCircle size={18} /> : <DollarSign size={18} />}
                                                            </button>
                                                            <button
                                                                onClick={() => deleteEntity(setWorkLogs, workLogs, log.id)}
                                                                className="p-2 ml-2 text-red-400 hover:text-red-600"
                                                                title="Excluir Lançamento"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                                            <td colSpan="5" className="p-3 text-right"> TOTAIS </td>
                                            <td className="p-3 text-right text-blue-800"> {formatCurrency(totals.total)} </td>
                                            <td className="print:hidden"> </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )
                }
            </main>

            <style> {`
        .input-field {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          background-color: #f9fafb;
          transition: border-color 0.2s;
        }
        .input-field:focus {
          outline: none;
          border-color: #2563eb;
          background-color: #fff;
        }
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white; }
          .shadow-lg, .shadow { box-shadow: none !important; }
        }
      `}</style>
        </div>
    );
}

// --- Minor Components ---

const TabButton = ({ id, label, icon: Icon, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${activeTab === id
            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
            : 'text-gray-500 hover:text-blue-500 hover:bg-gray-50'
            }`}
    >
        <Icon size={18} />
        {label}
    </button>
);

function DashboardCard({ title, value, icon: Icon, color, bgColor }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow border-l-4 flex items-center justify-between" style={{ borderColor: 'currentColor', color: color.replace('text-', '') }
        }>
            <div>
                <p className="text-gray-500 text-sm font-medium"> {title} </p>
                <p className={`text-2xl font-bold mt-1 ${color}`}> {formatCurrency(value)} </p>
            </div>
            <div className={`p-3 rounded-full ${bgColor} ${color}`}>
                <Icon size={24} />
            </div>
        </div>
    );
}

function ListItem({ text, onDelete }) {
    return (
        <li className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100 group hover:border-gray-300 transition-colors">
            <span className="font-medium text-gray-700"> {text} </span>
            <button onClick={onDelete} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={16} />
            </button>
        </li>
    );
}

function FormGroup({ label, children }) {
    return (
        <div className="flex flex-col">
            <label className="text-sm font-bold text-gray-700 mb-1"> {label} </label>
            {children}
        </div>
    );
}

function DatabaseIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
            <ellipse cx="12" cy="5" rx="9" ry="3"> </ellipse>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"> </path>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"> </path>
        </svg>
    );
}