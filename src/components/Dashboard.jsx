import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
    LayoutDashboard, 
    DollarSign, 
    Package, 
    TrendingUp, 
    BarChart3, 
    Users, 
    ShoppingCart, 
    UserCheck,
    LogOut,
    Menu,
    User
} from 'lucide-react';
import FluxoCaixa from './modules/FluxoCaixa';
import Estoque from './modules/Estoque';
import Rendimentos from './modules/Rendimentos';
import Graficos from './modules/Graficos';
import Clientes from './modules/Clientes';
import Vendas from './modules/Vendas';
import Vendedores from './modules/Vendedores';
import '../App.css';

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'fluxoCaixa', label: 'Fluxo de Caixa', icon: DollarSign },
    { id: 'estoque', label: 'Estoque', icon: Package },
    { id: 'rendimentos', label: 'Rendimentos', icon: TrendingUp },
    { id: 'graficos', label: 'Planilhas e Gráficos', icon: BarChart3 },
    { id: 'clientes', label: 'Cadastro de Clientes', icon: Users },
    { id: 'vendas', label: 'Vendas', icon: ShoppingCart },
    { id: 'vendedores', label: 'Contas de Vendedores', icon: UserCheck }
];

function DashboardHome({ currentUser, setActiveModule }) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Bem-vindo, {currentUser?.username}!
                </h1>
                <p className="text-gray-600 mt-2">
                    Gerencie seu negócio de forma eficiente com nosso sistema completo.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveModule('fluxoCaixa')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Fluxo de Caixa</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Controle suas entradas e saídas financeiras
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveModule('estoque')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estoque</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Gerencie seus produtos e quantidades
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveModule('vendas')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vendas</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Registre e acompanhe suas vendas
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveModule('clientes')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Cadastre e gerencie seus clientes
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveModule('rendimentos')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rendimentos</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Analise a performance do seu negócio
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveModule('graficos')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Relatórios</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Visualize dados e exporte planilhas
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { currentUser, logout } = useAuth();
    const [activeModule, setActiveModule] = useState('dashboard');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
    };

    const renderContent = () => {
        switch (activeModule) {
            case 'fluxoCaixa':
                return <FluxoCaixa />;
            case 'estoque':
                return <Estoque />;
            case 'rendimentos':
                return <Rendimentos />;
            case 'graficos':
                return <Graficos />;
            case 'clientes':
                return <Clientes />;
            case 'vendas':
                return <Vendas />;
            case 'vendedores':
                return <Vendedores />;
            default:
                return <DashboardHome currentUser={currentUser} setActiveModule={setActiveModule} />;
        }
    };

    const MenuItems = ({ onItemClick }) => (
        <nav className="space-y-2">
            {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                
                return (
                    <Button
                        key={item.id}
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                        onClick={() => {
                            setActiveModule(item.id);
                            if (onItemClick) onItemClick();
                        }}
                    >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                    </Button>
                );
            })}
        </nav>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center space-x-4">
                        {/* Menu Mobile */}
                        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="sm" className="md:hidden">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-64">
                                <div className="py-4">
                                    <h2 className="text-lg font-semibold mb-4">Menu</h2>
                                    <MenuItems onItemClick={() => setIsMenuOpen(false)} />
                                </div>
                            </SheetContent>
                        </Sheet>

                        {/* Logo/Título */}
                        <h1 className="text-xl font-bold text-gray-900">Sistema de Gestão</h1>
                    </div>

                    {/* Menu Desktop Horizontal */}
                    <nav className="hidden lg:flex items-center space-x-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeModule === item.id;
                            
                            return (
                                <Button
                                    key={item.id}
                                    variant={isActive ? "default" : "ghost"}
                                    size="sm"
                                    className={`${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                                    onClick={() => setActiveModule(item.id)}
                                >
                                    <Icon className="mr-2 h-4 w-4" />
                                    <span className="hidden xl:inline">{item.label}</span>
                                </Button>
                            );
                        })}
                    </nav>

                    {/* User Info e Logout */}
                    <div className="flex items-center space-x-3">
                        <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            <span>{currentUser.username}</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Sair</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-6">
                {renderContent()}
            </main>
        </div>
    );
}

