import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { WorkLogForm } from './components/WorkLogForm';
import { Reports } from './components/Reports';
import { Registries } from './components/Registries';
import Login from './components/Login';
import AuditLogs from './components/AuditLogs';
import { useData } from './hooks/useData';
import { Toaster } from 'sonner';

function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    return (token && storedUser) ? JSON.parse(storedUser) : null;
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    clientId: '',
    employeeId: '',
    status: 'all'
  });

  const handleLogin = (userData) => {
    // Token is already set in Login component
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setActiveTab('dashboard');
  };

  // Data hooks
  const { data: companies, addItem: addCompany, updateItem: updateCompany, deleteItem: deleteCompany } = useData('companies', []);
  const { data: employees, addItem: addEmployee, updateItem: updateEmployee, deleteItem: deleteEmployee } = useData('employees', []);
  const { data: services, addItem: addService, updateItem: updateService, deleteItem: deleteService } = useData('services', []);
  const { data: clients, addItem: addClient, updateItem: updateClient, deleteItem: deleteClient } = useData('clients', []);
  const { data: workLogs, addItem: addWorkLog, updateItem: updateWorkLog, deleteItem: deleteWorkLog } = useData('work-logs', []);
  const { data: coverageReasons, addItem: addCoverageReason, updateItem: updateCoverageReason, deleteItem: deleteCoverageReason } = useData('coverage-reasons', []);

  if (!user) {
    return (
      <>
        <Toaster position="top-right" />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard workLogs={workLogs} employees={employees} clients={clients} coverageReasons={coverageReasons} />;
      case 'work-logs':
        return (
          <WorkLogForm
            companies={companies}
            employees={employees}
            services={services}
            clients={clients}
            onAddLog={addWorkLog}
            workLogs={workLogs}
            onUpdateLog={updateWorkLog}
            onDeleteLog={deleteWorkLog}
            coverageReasons={coverageReasons}
            user={user}
          />
        );
      case 'registries':
        return (
          <Registries
            companies={companies}
            onAddCompany={addCompany}
            onUpdateCompany={updateCompany}
            onDeleteCompany={deleteCompany}
            employees={employees}
            onAddEmployee={addEmployee}
            onUpdateEmployee={updateEmployee}
            onDeleteEmployee={deleteEmployee}
            services={services}
            onAddService={addService}
            onUpdateService={updateService}
            onDeleteService={deleteService}
            clients={clients}
            onAddClient={addClient}
            onUpdateClient={updateClient}
            onDeleteClient={deleteClient}
            coverageReasons={coverageReasons}
            onAddCoverageReason={addCoverageReason}
            onUpdateCoverageReason={updateCoverageReason}
            onDeleteCoverageReason={deleteCoverageReason}
            user={user}
          />
        );
      case 'reports':
        return (
          <Reports
            workLogs={workLogs}
            filters={filters}
            setFilters={setFilters}
            employees={employees}
            clients={clients}
            services={services}
            myCompanies={companies}
            onDelete={deleteWorkLog}
            onUpdate={updateWorkLog}
            coverageReasons={coverageReasons}
            user={user}
          />
        );
      case 'audit-logs':
        return <AuditLogs />;
      default:
        return <Dashboard workLogs={workLogs} employees={employees} clients={clients} />;
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <Layout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      >
        {renderContent()}
      </Layout>
    </>
  );
}

export default App;
