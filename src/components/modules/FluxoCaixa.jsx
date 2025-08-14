import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, Filter, FileText } from 'lucide-react';
import { formatDateToDDMMYYYY, getCurrentDateYYYYMMDD } from '../../utils/dateUtils';
import '../../App.css';

export default function FluxoCaixa() {
    const [movimentacoes, setMovimentacoes] = useState([]);
    const [formData, setFormData] = useState({
        tipo: 'entrada',
        descricao: '',
        valor: '',
        data: getCurrentDateYYYYMMDD()
    });
    const [filtros, setFiltros] = useState({
        tipo: 'todos',
        dataInicio: '',
        dataFim: ''
    });
    const [relatorio, setRelatorio] = useState('');

    useEffect(() => {
        loadMovimentacoes();
    }, []);

    const loadMovimentacoes = () => {
        const data = JSON.parse(localStorage.getItem('fluxoCaixa')) || [];
        setMovimentacoes(data);
    };

    const saveMovimentacoes = (data) => {
        localStorage.setItem('fluxoCaixa', JSON.stringify(data));
        setMovimentacoes(data);
    };

    const calculateSaldo = (movs = movimentacoes) => {
        return movs.reduce((saldo, mov) => {
            return mov.tipo === 'entrada' ? saldo + mov.valor : saldo - mov.valor;
        }, 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newId = movimentacoes.length > 0 ? Math.max(...movimentacoes.map(m => m.id)) + 1 : 1;
        const novaMovimentacao = {
            id: newId,
            tipo: formData.tipo,
            descricao: formData.descricao,
            valor: parseFloat(formData.valor),
            data: formatDateToDDMMYYYY(formData.data)
        };
        
        const updatedMovimentacoes = [...movimentacoes, novaMovimentacao];
        saveMovimentacoes(updatedMovimentacoes);
        
        setFormData({
            tipo: 'entrada',
            descricao: '',
            valor: '',
            data: getCurrentDateYYYYMMDD()
        });
    };

    const getFilteredMovimentacoes = () => {
        let filtered = [...movimentacoes];
        
        if (filtros.tipo !== 'todos') {
            filtered = filtered.filter(mov => mov.tipo === filtros.tipo);
        }
        
        if (filtros.dataInicio) {
            filtered = filtered.filter(mov => {
                const [day, month, year] = mov.data.split('/');
                const movDate = `${year}-${month}-${day}`;
                return movDate >= filtros.dataInicio;
            });
        }
        
        if (filtros.dataFim) {
            filtered = filtered.filter(mov => {
                const [day, month, year] = mov.data.split('/');
                const movDate = `${year}-${month}-${day}`;
                return movDate <= filtros.dataFim;
            });
        }
        
        return filtered;
    };

    const gerarRelatorioMensal = () => {
        const relatorioData = {};
        
        movimentacoes.forEach(mov => {
            const [day, month, year] = mov.data.split('/');
            const mesAno = `${year}-${month}`;
            
            if (!relatorioData[mesAno]) {
                relatorioData[mesAno] = { entradas: 0, saidas: 0, saldo: 0 };
            }
            
            if (mov.tipo === 'entrada') {
                relatorioData[mesAno].entradas += mov.valor;
            } else {
                relatorioData[mesAno].saidas += mov.valor;
            }
            relatorioData[mesAno].saldo = relatorioData[mesAno].entradas - relatorioData[mesAno].saidas;
        });

        let relatorioText = 'RELATÓRIO MENSAL\n\n';
        Object.entries(relatorioData).forEach(([mesAno, dados]) => {
            const [year, month] = mesAno.split('-');
            relatorioText += `${month}/${year}:\n`;
            relatorioText += `  Entradas: ${dados.entradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n`;
            relatorioText += `  Saídas: ${dados.saidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n`;
            relatorioText += `  Saldo: ${dados.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n\n`;
        });
        
        setRelatorio(relatorioText);
    };

    const filteredMovimentacoes = getFilteredMovimentacoes();
    const saldoAtual = calculateSaldo();
    const entradas = movimentacoes.filter(m => m.tipo === 'entrada').reduce((sum, m) => sum + m.valor, 0);
    const saidas = movimentacoes.filter(m => m.tipo === 'saida').reduce((sum, m) => sum + m.valor, 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Fluxo de Caixa</h1>
                <p className="text-gray-600 mt-2">Controle suas entradas e saídas financeiras</p>
            </div>

            {/* Cards de resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {saldoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {entradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Saídas</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {saidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Formulário */}
            <Card>
                <CardHeader>
                    <CardTitle>Nova Movimentação</CardTitle>
                    <CardDescription>Registre uma nova entrada ou saída</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tipo">Tipo</Label>
                            <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="entrada">Entrada</SelectItem>
                                    <SelectItem value="saida">Saída</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="descricao">Descrição</Label>
                            <Input
                                id="descricao"
                                value={formData.descricao}
                                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                                placeholder="Descrição da movimentação"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="valor">Valor</Label>
                            <Input
                                id="valor"
                                type="number"
                                step="0.01"
                                value={formData.valor}
                                onChange={(e) => setFormData({...formData, valor: e.target.value})}
                                placeholder="0,00"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="data">Data</Label>
                            <Input
                                id="data"
                                type="date"
                                value={formData.data}
                                onChange={(e) => setFormData({...formData, data: e.target.value})}
                                required
                            />
                        </div>

                        <div className="md:col-span-4">
                            <Button type="submit" className="w-full md:w-auto">
                                Registrar Movimentação
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Filtros */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filtros
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select value={filtros.tipo} onValueChange={(value) => setFiltros({...filtros, tipo: value})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos</SelectItem>
                                    <SelectItem value="entrada">Entrada</SelectItem>
                                    <SelectItem value="saida">Saída</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Data Início</Label>
                            <Input
                                type="date"
                                value={filtros.dataInicio}
                                onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Data Fim</Label>
                            <Input
                                type="date"
                                value={filtros.dataFim}
                                onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Relatórios</Label>
                            <Button 
                                onClick={gerarRelatorioMensal} 
                                variant="outline" 
                                className="w-full"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Relatório Mensal
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Relatório */}
            {relatorio && (
                <Card>
                    <CardHeader>
                        <CardTitle>Relatório</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
                            {relatorio}
                        </pre>
                    </CardContent>
                </Card>
            )}

            {/* Tabela de movimentações */}
            <Card>
                <CardHeader>
                    <CardTitle>Movimentações</CardTitle>
                    <CardDescription>
                        {filteredMovimentacoes.length} movimentação(ões) encontrada(s)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Valor</TableHead>
                                    <TableHead>Data</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMovimentacoes.map((mov) => (
                                    <TableRow key={mov.id}>
                                        <TableCell className="font-medium">{mov.id}</TableCell>
                                        <TableCell>
                                            <Badge variant={mov.tipo === 'entrada' ? 'default' : 'destructive'}>
                                                {mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{mov.descricao}</TableCell>
                                        <TableCell className={mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}>
                                            {mov.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </TableCell>
                                        <TableCell>{mov.data}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

