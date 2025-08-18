import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingCart, Plus, Trash2, DollarSign, Package, CreditCard, AlertCircle } from 'lucide-react';
import { formatDateToDDMMYYYY, getCurrentDateYYYYMMDD } from '../../utils/dateUtils';
import '../../App.css';

export default function Vendas() {
    const { currentUser } = useAuth();
    const [vendas, setVendas] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [carrinho, setCarrinho] = useState([]);
    const [formData, setFormData] = useState({
        data: getCurrentDateYYYYMMDD(),
        metodoPagamento: 'PIX'
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedProduto, setSelectedProduto] = useState('');
    const [quantidade, setQuantidade] = useState('1');
    const [error, setError] = useState('');

    useEffect(() => {
        loadVendas();
        loadProdutos();
    }, []);

    const loadVendas = () => {
        const data = JSON.parse(localStorage.getItem('vendas')) || [];
        setVendas(data);
    };

    const loadProdutos = () => {
        const data = JSON.parse(localStorage.getItem('produtos')) || [];
        setProdutos(data);
    };

    const saveVendas = (data) => {
        localStorage.setItem('vendas', JSON.stringify(data));
        setVendas(data);
    };

    const saveProdutos = (data) => {
        localStorage.setItem('produtos', JSON.stringify(data));
        setProdutos(data);
    };

    const [clientes, setClientes] = useState([]);
    const [selectedCliente, setSelectedCliente] = useState('');

    useEffect(() => {
        loadVendas();
        loadProdutos();
        loadClientes();
    }, []);

    const loadClientes = () => {
        const data = JSON.parse(localStorage.getItem('clientes')) || [];
        setClientes(data);
    };

    const addToCarrinho = () => {
        if (!selectedProduto || !quantidade) {
            setError('Selecione um produto e quantidade');
            return;
        }

        const produto = produtos.find(p => p.id === parseInt(selectedProduto));
        const qtd = parseInt(quantidade);

        if (qtd > produto.quantidade) {
            setError(`Quantidade indisponível. Estoque: ${produto.quantidade}`);
            return;
        }

        const itemExistente = carrinho.find(item => item.id === produto.id);
        
        if (itemExistente) {
            const novaQuantidade = itemExistente.quantidade + qtd;
            if (novaQuantidade > produto.quantidade) {
                setError(`Quantidade total excede o estoque disponível (${produto.quantidade})`);
                return;
            }
            setCarrinho(carrinho.map(item => 
                item.id === produto.id 
                    ? { ...item, quantidade: novaQuantidade }
                    : item
            ));
        } else {
            setCarrinho([...carrinho, {
                id: produto.id,
                nome: produto.nome,
                precoUnitario: produto.precoUnitario,
                quantidade: qtd,
                estoqueDisponivel: produto.quantidade
            }]);
        }

        setSelectedProduto('');
        setQuantidade('1');
        setError('');
    };

    const removeFromCarrinho = (id) => {
        setCarrinho(carrinho.filter(item => item.id !== id));
    };

    const updateQuantidadeCarrinho = (id, novaQuantidade) => {
        if (novaQuantidade <= 0) {
            removeFromCarrinho(id);
            return;
        }

        const item = carrinho.find(item => item.id === id);
        if (novaQuantidade > item.estoqueDisponivel) {
            setError(`Quantidade excede o estoque disponível (${item.estoqueDisponivel})`);
            return;
        }

        setCarrinho(carrinho.map(item => 
            item.id === id 
                ? { ...item, quantidade: novaQuantidade }
                : item
        ));
        setError('');
    };

    const calculateTotal = () => {
        return carrinho.reduce((total, item) => total + (item.precoUnitario * item.quantidade), 0);
    };

    const finalizarVenda = () => {
        if (carrinho.length === 0) {
            setError('Adicione produtos ao carrinho');
            return;
        }

        const newId = vendas.length > 0 ? Math.max(...vendas.map(v => v.id)) + 1 : 1;
        const novaVenda = {
            id: newId,
            data: formatDateToDDMMYYYY(formData.data),
            produtos: carrinho.map(item => ({ id: item.id, quantidade: item.quantidade })),
            total: calculateTotal(),
            metodoPagamento: formData.metodoPagamento,
            vendedorId: currentUser.id,
            clienteId: selectedCliente ? parseInt(selectedCliente) : null
        };

        // Atualizar estoque
        const produtosAtualizados = produtos.map(produto => {
            const itemVendido = carrinho.find(item => item.id === produto.id);
            if (itemVendido) {
                return {
                    ...produto,
                    quantidade: produto.quantidade - itemVendido.quantidade
                };
            }
            return produto;
        });

        // Adicionar ao fluxo de caixa
        const fluxoCaixa = JSON.parse(localStorage.getItem('fluxoCaixa')) || [];
        const novaEntrada = {
            id: fluxoCaixa.length > 0 ? Math.max(...fluxoCaixa.map(f => f.id)) + 1 : 1,
            tipo: 'entrada',
            descricao: `Venda #${newId}`,
            valor: calculateTotal(),
            data: formatDateToDDMMYYYY(formData.data)
        };
        localStorage.setItem('fluxoCaixa', JSON.stringify([...fluxoCaixa, novaEntrada]));

        saveVendas([...vendas, novaVenda]);
        saveProdutos(produtosAtualizados);
        
        setCarrinho([]);
        setFormData({
            data: getCurrentDateYYYYMMDD(),
            metodoPagamento: 'PIX'
        });
        setIsDialogOpen(false);
        setError('');
    };

    const resetForm = () => {
        setCarrinho([]);
        setFormData({
            data: getCurrentDateYYYYMMDD(),
            metodoPagamento: 'PIX'
        });
        setSelectedProduto('');
        setQuantidade('1');
        setError('');
    };

    const getVendedorNome = (vendedorId) => {
        const vendedores = JSON.parse(localStorage.getItem('vendedores')) || [];
        const vendedor = vendedores.find(v => v.id === vendedorId);
        return vendedor ? vendedor.username : 'N/A';
    };

    const getProdutoNome = (produtoId) => {
        const produto = produtos.find(p => p.id === produtoId);
        return produto ? produto.nome : 'Produto não encontrado';
    };

    const getClienteNome = (clienteId) => {
        const cliente = clientes.find(c => c.id === clienteId);
        return cliente ? cliente.nome : 'Cliente não encontrado';
    };

    const totalVendas = vendas.length;
    const vendasHoje = vendas.filter(v => v.data === formatDateToDDMMYYYY(getCurrentDateYYYYMMDD())).length;
    const faturamentoTotal = vendas.reduce((sum, v) => sum + v.total, 0);
    const faturamentoHoje = vendas
        .filter(v => v.data === formatDateToDDMMYYYY(getCurrentDateYYYYMMDD()))
        .reduce((sum, v) => sum + v.total, 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Sistema de Vendas</h1>
                    <p className="text-gray-600 mt-2">Registre e gerencie suas vendas</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Venda
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Nova Venda</DialogTitle>
                            <DialogDescription>
                                Adicione produtos ao carrinho e finalize a venda
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                            {/* Informações da venda */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Cliente</Label>
                                    <Select value={selectedCliente} onValueChange={setSelectedCliente}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione um cliente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clientes.map((cliente) => (
                                                <SelectItem key={cliente.id} value={cliente.id.toString()}>
                                                    {cliente.nome} - {cliente.cpf}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="data">Data da Venda</Label>
                                    <Input
                                        id="data"
                                        type="date"
                                        value={formData.data}
                                        onChange={(e) => setFormData({...formData, data: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Método de Pagamento</Label>
                                    <Select value={formData.metodoPagamento} onValueChange={(value) => setFormData({...formData, metodoPagamento: value})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PIX">PIX</SelectItem>
                                            <SelectItem value="Cartão">Cartão</SelectItem>
                                            <SelectItem value="Espécie">Espécie</SelectItem>
                                            <SelectItem value="Transferência">Transferência</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Adicionar produtos */}
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-medium mb-4">Adicionar Produtos</h3>
                                <div className="grid grid-cols-3 gap-4 items-end">
                                    <div className="space-y-2">
                                        <Label>Produto</Label>
                                        <Select value={selectedProduto} onValueChange={setSelectedProduto}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um produto" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {produtos.filter(p => p.quantidade > 0).map(produto => (
                                                    <SelectItem key={produto.id} value={produto.id.toString()}>
                                                        {produto.nome} - {produto.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (Estoque: {produto.quantidade})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Quantidade</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={quantidade}
                                            onChange={(e) => setQuantidade(e.target.value)}
                                        />
                                    </div>

                                    <Button onClick={addToCarrinho}>
                                        Adicionar
                                    </Button>
                                </div>

                                {error && (
                                    <Alert variant="destructive" className="mt-4">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            {/* Carrinho */}
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-medium mb-4">Carrinho de Compras</h3>
                                {carrinho.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">Nenhum produto adicionado</p>
                                ) : (
                                    <div className="space-y-4">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Produto</TableHead>
                                                    <TableHead>Preço Unit.</TableHead>
                                                    <TableHead>Qtd.</TableHead>
                                                    <TableHead>Subtotal</TableHead>
                                                    <TableHead>Ações</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {carrinho.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell>{item.nome}</TableCell>
                                                        <TableCell>
                                                            {item.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                max={item.estoqueDisponivel}
                                                                value={item.quantidade}
                                                                onChange={(e) => updateQuantidadeCarrinho(item.id, parseInt(e.target.value))}
                                                                className="w-20"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            {(item.precoUnitario * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => removeFromCarrinho(item.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>

                                        <div className="flex justify-between items-center text-lg font-bold border-t pt-4">
                                            <span>Total:</span>
                                            <span>{calculateTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button onClick={finalizarVenda} disabled={carrinho.length === 0}>
                                    Finalizar Venda
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Cards de resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalVendas}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
                        <Package className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{vendasHoje}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {faturamentoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Faturamento Hoje</CardTitle>
                        <CreditCard className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            {faturamentoHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabela de vendas */}
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Vendas</CardTitle>
                    <CardDescription>
                        {vendas.length} venda(s) registrada(s)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Produtos</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Pagamento</TableHead>
                                    <TableHead>Vendedor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vendas.map((venda) => (
                                    <TableRow key={venda.id}>
                                        <TableCell className="font-medium">{venda.id}</TableCell>
                                        <TableCell>{venda.data}</TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {venda.produtos.map((produto, index) => (
                                                    <div key={index} className="text-sm">
                                                        {getProdutoNome(produto.id)} ({produto.quantidade}x)
                                                    </div>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-green-600 font-medium">
                                            {venda.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {venda.metodoPagamento}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{getVendedorNome(venda.vendedorId)}</TableCell>
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

