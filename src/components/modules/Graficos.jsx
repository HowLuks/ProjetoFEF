import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileSpreadsheet, BarChart3, TrendingUp, Filter, Calendar, DollarSign, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatDateToDDMMYYYY, getCurrentDateDDMMYYYY } from '../../utils/dateUtils';
import '../../App.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Graficos() {
    const [vendasData, setVendasData] = useState([]);
    const [produtosData, setProdutosData] = useState([]);
    const [clientesData, setClientesData] = useState([]);
    
    // Estados para filtros
    const [filtros, setFiltros] = useState({
        nome: '',
        dataInicio: '',
        dataFim: '',
        valorMin: '',
        valorMax: '',
        tipoRelatorio: 'vendas'
    });

    useEffect(() => {
        prepareChartData();
    }, []);

    const prepareChartData = () => {
        const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
        const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        const clientes = JSON.parse(localStorage.getItem('clientes')) || [];

        // Dados de vendas por dia
        const dailySales = {};
        vendas.forEach(venda => {
            const data = venda.data;
            if (!dailySales[data]) {
                dailySales[data] = { data, vendas: 0, lucro: 0 };
            }
            dailySales[data].vendas += venda.total;
            
            // Calcular lucro (assumindo 40% de margem)
            const lucro = venda.total * 0.4;
            dailySales[data].lucro += lucro;
        });

        const sortedSalesData = Object.values(dailySales).sort((a, b) => {
            const [dA, mA, yA] = a.data.split('/');
            const [dB, mB, yB] = b.data.split('/');
            const dateA = new Date(parseInt(yA), parseInt(mA) - 1, parseInt(dA));
            const dateB = new Date(parseInt(yB), parseInt(mB) - 1, parseInt(dB));
            return dateA - dateB;
        });

        setVendasData(sortedSalesData);

        // Dados de produtos mais vendidos
        const produtoVendas = {};
        vendas.forEach(venda => {
            venda.produtos.forEach(produto => {
                const nome = produto.nome;
                if (!produtoVendas[nome]) {
                    produtoVendas[nome] = { nome, quantidade: 0, receita: 0 };
                }
                produtoVendas[nome].quantidade += produto.quantidade;
                produtoVendas[nome].receita += produto.preco * produto.quantidade;
            });
        });

        const sortedProdutosData = Object.values(produtoVendas)
            .sort((a, b) => b.receita - a.receita)
            .slice(0, 5);

        setProdutosData(sortedProdutosData);

        // Dados de clientes
        const clienteVendas = {};
        vendas.forEach(venda => {
            const cliente = venda.cliente;
            if (!clienteVendas[cliente]) {
                clienteVendas[cliente] = { nome: cliente, total: 0, compras: 0 };
            }
            clienteVendas[cliente].total += venda.total;
            clienteVendas[cliente].compras += 1;
        });

        const sortedClientesData = Object.values(clienteVendas)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        setClientesData(sortedClientesData);
    };

    const aplicarFiltros = (dados, tipo) => {
        return dados.filter(item => {
            // Filtro por nome/descrição
            if (filtros.nome) {
                const nome = tipo === 'vendas' ? item.cliente : 
                           tipo === 'produtos' ? item.nome : 
                           tipo === 'clientes' ? item.nome :
                           tipo === 'caixa' ? item.descricao : '';
                
                if (!nome.toLowerCase().includes(filtros.nome.toLowerCase())) {
                    return false;
                }
            }

            // Filtro por data
            if (filtros.dataInicio || filtros.dataFim) {
                const dataItem = item.data;
                if (dataItem) {
                    const [dia, mes, ano] = dataItem.split('/');
                    const dataItemDate = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
                    
                    if (filtros.dataInicio) {
                        const [diaInicio, mesInicio, anoInicio] = filtros.dataInicio.split('/');
                        const dataInicioDate = new Date(parseInt(anoInicio), parseInt(mesInicio) - 1, parseInt(diaInicio));
                        if (dataItemDate < dataInicioDate) return false;
                    }
                    
                    if (filtros.dataFim) {
                        const [diaFim, mesFim, anoFim] = filtros.dataFim.split('/');
                        const dataFimDate = new Date(parseInt(anoFim), parseInt(mesFim) - 1, parseInt(diaFim));
                        if (dataItemDate > dataFimDate) return false;
                    }
                }
            }

            // Filtro por valor
            if (filtros.valorMin || filtros.valorMax) {
                const valor = tipo === 'vendas' ? item.total :
                            tipo === 'produtos' ? item.receita :
                            tipo === 'clientes' ? item.total :
                            tipo === 'caixa' ? Math.abs(item.valor) : 0;
                
                if (filtros.valorMin && valor < parseFloat(filtros.valorMin)) {
                    return false;
                }
                
                if (filtros.valorMax && valor > parseFloat(filtros.valorMax)) {
                    return false;
                }
            }

            return true;
        });
    };

    const exportarPlanilha = (tipo) => {
        let dados = [];
        let nomeArquivo = '';

        switch (tipo) {
            case 'vendas':
                dados = JSON.parse(localStorage.getItem('vendas')) || [];
                nomeArquivo = 'vendas';
                break;
            case 'produtos':
                dados = JSON.parse(localStorage.getItem('produtos')) || [];
                nomeArquivo = 'produtos';
                break;
            case 'clientes':
                dados = JSON.parse(localStorage.getItem('clientes')) || [];
                nomeArquivo = 'clientes';
                break;
            case 'caixa':
                dados = JSON.parse(localStorage.getItem('movimentacoesCaixa')) || [];
                nomeArquivo = 'fluxo_caixa';
                break;
            default:
                return;
        }

        // Aplicar filtros
        const dadosFiltrados = aplicarFiltros(dados, tipo);

        if (dadosFiltrados.length === 0) {
            alert('Nenhum dado encontrado com os filtros aplicados.');
            return;
        }

        // Preparar dados para exportação
        let dadosParaExportar = [];

        switch (tipo) {
            case 'vendas':
                dadosParaExportar = dadosFiltrados.map(venda => ({
                    'ID': venda.id,
                    'Data': venda.data,
                    'Cliente': venda.cliente,
                    'Produtos': venda.produtos.map(p => `${p.nome} (${p.quantidade}x)`).join(', '),
                    'Total': `R$ ${venda.total.toFixed(2).replace('.', ',')}`,
                    'Pagamento': venda.pagamento,
                    'Vendedor': venda.vendedor
                }));
                break;
            case 'produtos':
                dadosParaExportar = dadosFiltrados.map(produto => ({
                    'ID': produto.id,
                    'Nome': produto.nome,
                    'Categoria': produto.categoria,
                    'Preço': `R$ ${produto.preco.toFixed(2).replace('.', ',')}`,
                    'Estoque': produto.estoque,
                    'Estoque Mínimo': produto.estoqueMinimo
                }));
                break;
            case 'clientes':
                dadosParaExportar = dadosFiltrados.map(cliente => ({
                    'ID': cliente.id,
                    'Nome': cliente.nome,
                    'Email': cliente.email,
                    'Telefone': cliente.telefone,
                    'Endereço': cliente.endereco,
                    'Data Cadastro': cliente.dataCadastro
                }));
                break;
            case 'caixa':
                dadosParaExportar = dadosFiltrados.map(mov => ({
                    'ID': mov.id,
                    'Data': mov.data,
                    'Tipo': mov.tipo,
                    'Descrição': mov.descricao,
                    'Valor': `R$ ${mov.valor.toFixed(2).replace('.', ',')}`,
                    'Saldo': `R$ ${mov.saldo.toFixed(2).replace('.', ',')}`
                }));
                break;
        }

        // Criar e baixar arquivo Excel
        const ws = XLSX.utils.json_to_sheet(dadosParaExportar);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, tipo.charAt(0).toUpperCase() + tipo.slice(1));
        
        const dataAtual = getCurrentDateDDMMYYYY().replace(/\//g, '-');
        const nomeComFiltros = filtros.nome ? `_${filtros.nome}` : '';
        const nomeCompleto = `${nomeArquivo}${nomeComFiltros}_${dataAtual}.xlsx`;
        
        XLSX.writeFile(wb, nomeCompleto);
    };

    const limparFiltros = () => {
        setFiltros({
            nome: '',
            dataInicio: '',
            dataFim: '',
            valorMin: '',
            valorMax: '',
            tipoRelatorio: 'vendas'
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Planilhas e Gráficos</h1>
                <p className="text-gray-600 mt-2">Visualize dados e exporte relatórios personalizados</p>
            </div>

            {/* Seção de Filtros para Exportação */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtros para Exportação de Planilhas
                    </CardTitle>
                    <CardDescription>
                        Configure os filtros para personalizar os dados exportados
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tipoRelatorio">Tipo de Relatório</Label>
                            <Select 
                                value={filtros.tipoRelatorio} 
                                onValueChange={(value) => setFiltros({...filtros, tipoRelatorio: value})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="vendas">Vendas</SelectItem>
                                    <SelectItem value="produtos">Produtos</SelectItem>
                                    <SelectItem value="clientes">Clientes</SelectItem>
                                    <SelectItem value="caixa">Fluxo de Caixa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome/Descrição</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="nome"
                                    placeholder="Filtrar por nome..."
                                    value={filtros.nome}
                                    onChange={(e) => setFiltros({...filtros, nome: e.target.value})}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dataInicio">Data Início</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="dataInicio"
                                    type="date"
                                    value={filtros.dataInicio ? filtros.dataInicio.split('/').reverse().join('-') : ''}
                                    onChange={(e) => {
                                        const date = e.target.value;
                                        const formattedDate = date ? date.split('-').reverse().join('/') : '';
                                        setFiltros({...filtros, dataInicio: formattedDate});
                                    }}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dataFim">Data Fim</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="dataFim"
                                    type="date"
                                    value={filtros.dataFim ? filtros.dataFim.split('/').reverse().join('-') : ''}
                                    onChange={(e) => {
                                        const date = e.target.value;
                                        const formattedDate = date ? date.split('-').reverse().join('/') : '';
                                        setFiltros({...filtros, dataFim: formattedDate});
                                    }}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="valorMin">Valor Mínimo</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="valorMin"
                                    type="number"
                                    placeholder="0,00"
                                    value={filtros.valorMin}
                                    onChange={(e) => setFiltros({...filtros, valorMin: e.target.value})}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="valorMax">Valor Máximo</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="valorMax"
                                    type="number"
                                    placeholder="0,00"
                                    value={filtros.valorMax}
                                    onChange={(e) => setFiltros({...filtros, valorMax: e.target.value})}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex flex-wrap gap-3">
                        <Button 
                            onClick={() => exportarPlanilha(filtros.tipoRelatorio)}
                            className="flex items-center gap-2"
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            Exportar Planilha Filtrada
                        </Button>
                        
                        <Button 
                            variant="outline" 
                            onClick={limparFiltros}
                            className="flex items-center gap-2"
                        >
                            Limpar Filtros
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Seção de Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Vendas por Dia
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={vendasData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="data" />
                                <YAxis />
                                <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Vendas']} />
                                <Line type="monotone" dataKey="vendas" stroke="#8884d8" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Produtos Mais Vendidos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={produtosData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="nome" />
                                <YAxis />
                                <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Receita']} />
                                <Bar dataKey="receita" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Lucro por Dia</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={vendasData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="data" />
                                <YAxis />
                                <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Lucro']} />
                                <Line type="monotone" dataKey="lucro" stroke="#ffc658" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Clientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={clientesData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="total"
                                >
                                    {clientesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Total Gasto']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Exportação Rápida */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Exportação Rápida (Sem Filtros)
                    </CardTitle>
                    <CardDescription>
                        Exporte todos os dados sem aplicar filtros
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button 
                            variant="outline" 
                            onClick={() => exportarPlanilha('vendas')}
                            className="flex items-center gap-2"
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            Exportar Vendas
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => exportarPlanilha('produtos')}
                            className="flex items-center gap-2"
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            Exportar Produtos
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => exportarPlanilha('clientes')}
                            className="flex items-center gap-2"
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            Exportar Clientes
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => exportarPlanilha('caixa')}
                            className="flex items-center gap-2"
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            Exportar Fluxo de Caixa
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

