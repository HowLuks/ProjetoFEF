import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    DollarSign, 
    Package, 
    TrendingUp, 
    BarChart3, 
    Users, 
    ShoppingCart, 
    Calendar
} from 'lucide-react';
import FluxoCaixa from './modules/FluxoCaixa';
import Estoque from './modules/Estoque';
import Rendimentos from './modules/Rendimentos';
import Graficos from './modules/Graficos';
import Clientes from './modules/Clientes';
import Vendas from './modules/Vendas';
import Agendamentos from './modules/Agendamentos';
import Vendedores from './modules/Vendedores';
import Sidebar from './Sidebar';
import '../App.css';

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

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveModule('agendamentos')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Gerencie seus horários e compromissos
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
    const { currentUser } = useAuth();
    const [activeModule, setActiveModule] = useState('dashboard');

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
            case 'agendamentos':
                return <Agendamentos />;
            case 'vendedores':
                return <Vendedores />;
            default:
                return <DashboardHome currentUser={currentUser} setActiveModule={setActiveModule} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
            <main className="main-content flex-1 p-6">
                {renderContent()}
            </main>
        </div>
    );
}

