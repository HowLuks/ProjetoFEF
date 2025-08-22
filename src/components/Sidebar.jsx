import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = ({ activeModule, setActiveModule }) => {
    const { logout } = useAuth();

    const menuItems = [
        {
            group: 'Menu Principal',
            items: [
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'fluxoCaixa', label: 'Fluxo de Caixa' },
                { id: 'estoque', label: 'Estoque' },
                { id: 'vendas', label: 'Vendas' },
                { id: 'rendimentos', label: 'Rendimentos' },
                { id: 'graficos', label: 'Planilhas e Gráficos' },
                { id: 'agendamentos', label: 'Agendamentos' }
            ]
        },
        {
            group: 'Menu de Cadastro',
            items: [
                { id: 'clientes', label: 'Clientes' },
                { id: 'vendedores', label: 'Usuários' }
            ]
        },
        {
            group: 'Menu de Configuração',
            items: [
                { id: 'sair', label: 'Sair', action: logout }
            ]
        }
    ];

    const handleMenuClick = (item) => {
        if (item.action) {
            item.action();
        } else {
            setActiveModule(item.id);
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2>Sistema de Gestão</h2>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    {menuItems.map((group, groupIndex) => (
                        <React.Fragment key={groupIndex}>
                            <li className="menu-group-title">{group.group}</li>
                            {group.items.map((item) => (
                                <li 
                                    key={item.id} 
                                    className={`menu-item ${activeModule === item.id ? 'active' : ''}`}
                                    onClick={() => handleMenuClick(item)}
                                >
                                    <a href="#">{item.label}</a>
                                </li>
                            ))}
                        </React.Fragment>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;

