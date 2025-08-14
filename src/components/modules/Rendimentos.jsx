import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Calendar, Target } from 'lucide-react';
import '../../App.css';

export default function Rendimentos() {
    const [rendimentosData, setRendimentosData] = useState([]);
    const [resumo, setResumo] = useState({
        lucroTotal: 0,
        vendaTotal: 0,
        custoTotal: 0,
        margemLucro: 0
    });

    useEffect(() => {
        calculateRendimentos();
    }, []);

    const calculateRendimentos = () => {
        const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
        const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        
        const monthlyData = {};
        let lucroTotal = 0;
        let vendaTotal = 0;
        let custoTotal = 0;

        vendas.forEach(venda => {
            const [day, month, year] = venda.data.split('/');
            const mesAno = `${month}/${year}`;
            
            if (!monthlyData[mesAno]) {
                monthlyData[mesAno] = {
                    mes: mesAno,
                    vendas: 0,
                    custos: 0,
                    lucro: 0
                };
            }

            // Calcular custo da venda
            let custoVenda = 0;
            venda.produtos.forEach(itemVenda => {
                const produto = produtos.find(p => p.id === itemVenda.id);
                if (produto) {
                    // Assumindo que o custo é 60% do preço de venda
                    const custoProduto = produto.precoUnitario * 0.6;
                    custoVenda += custoProduto * itemVenda.quantidade;
                }
            });

            const lucroVenda = venda.total - custoVenda;

            monthlyData[mesAno].vendas += venda.total;
            monthlyData[mesAno].custos += custoVenda;
            monthlyData[mesAno].lucro += lucroVenda;

            vendaTotal += venda.total;
            custoTotal += custoVenda;
            lucroTotal += lucroVenda;
        });

        const chartData = Object.values(monthlyData).sort((a, b) => {
            const [monthA, yearA] = a.mes.split('/');
            const [monthB, yearB] = b.mes.split('/');
            const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1);
            const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1);
            return dateA - dateB;
        });

        setRendimentosData(chartData);
        setResumo({
            lucroTotal,
            vendaTotal,
            custoTotal,
            margemLucro: vendaTotal > 0 ? (lucroTotal / vendaTotal) * 100 : 0
        });
    };

    const formatCurrency = (value) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium">{`Mês: ${label}`}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {`${entry.dataKey === 'vendas' ? 'Vendas' : 
                               entry.dataKey === 'custos' ? 'Custos' : 'Lucro'}: ${formatCurrency(entry.value)}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Controle de Rendimentos</h1>
                <p className="text-gray-600 mt-2">Analise a performance financeira do seu negócio</p>
            </div>

            {/* Cards de resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(resumo.lucroTotal)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Lucro acumulado
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vendas Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(resumo.vendaTotal)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Receita total
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Custos Total</CardTitle>
                        <Target className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(resumo.custoTotal)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Custos operacionais
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
                        <Calendar className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            {resumo.margemLucro.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Percentual de lucro
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Gráfico de barras - Vendas, Custos e Lucro */}
            <Card>
                <CardHeader>
                    <CardTitle>Análise Mensal - Vendas, Custos e Lucro</CardTitle>
                    <CardDescription>
                        Comparativo mensal de vendas, custos e lucro
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={rendimentosData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="mes" />
                                <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="vendas" fill="#3b82f6" name="Vendas" />
                                <Bar dataKey="custos" fill="#ef4444" name="Custos" />
                                <Bar dataKey="lucro" fill="#10b981" name="Lucro" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Gráfico de linha - Evolução do Lucro */}
            <Card>
                <CardHeader>
                    <CardTitle>Evolução do Lucro</CardTitle>
                    <CardDescription>
                        Tendência de crescimento do lucro ao longo do tempo
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={rendimentosData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="mes" />
                                <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line 
                                    type="monotone" 
                                    dataKey="lucro" 
                                    stroke="#10b981" 
                                    strokeWidth={3}
                                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Tabela de dados mensais */}
            <Card>
                <CardHeader>
                    <CardTitle>Dados Mensais Detalhados</CardTitle>
                    <CardDescription>
                        Breakdown mensal de vendas, custos e lucros
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Mês</th>
                                    <th className="text-right p-2">Vendas</th>
                                    <th className="text-right p-2">Custos</th>
                                    <th className="text-right p-2">Lucro</th>
                                    <th className="text-right p-2">Margem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rendimentosData.map((item, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="p-2 font-medium">{item.mes}</td>
                                        <td className="p-2 text-right text-blue-600">
                                            {formatCurrency(item.vendas)}
                                        </td>
                                        <td className="p-2 text-right text-red-600">
                                            {formatCurrency(item.custos)}
                                        </td>
                                        <td className="p-2 text-right text-green-600">
                                            {formatCurrency(item.lucro)}
                                        </td>
                                        <td className="p-2 text-right text-purple-600">
                                            {item.vendas > 0 ? ((item.lucro / item.vendas) * 100).toFixed(1) : 0}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

