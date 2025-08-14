import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import '../../App.css';

export default function Estoque() {
    const [produtos, setProdutos] = useState([]);
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        quantidade: '',
        precoUnitario: '',
        codigo: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        loadProdutos();
    }, []);

    const loadProdutos = () => {
        const data = JSON.parse(localStorage.getItem('produtos')) || [];
        setProdutos(data);
    };

    const saveProdutos = (data) => {
        localStorage.setItem('produtos', JSON.stringify(data));
        setProdutos(data);
    };

    const resetForm = () => {
        setFormData({
            nome: '',
            descricao: '',
            quantidade: '',
            precoUnitario: '',
            codigo: ''
        });
        setEditingId(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const produtoData = {
            nome: formData.nome,
            descricao: formData.descricao,
            quantidade: parseInt(formData.quantidade),
            precoUnitario: parseFloat(formData.precoUnitario),
            codigo: formData.codigo
        };

        let updatedProdutos;
        
        if (editingId) {
            updatedProdutos = produtos.map(produto => 
                produto.id === editingId 
                    ? { ...produto, ...produtoData }
                    : produto
            );
        } else {
            const newId = produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1;
            updatedProdutos = [...produtos, { id: newId, ...produtoData }];
        }
        
        saveProdutos(updatedProdutos);
        resetForm();
        setIsDialogOpen(false);
    };

    const handleEdit = (produto) => {
        setFormData({
            nome: produto.nome,
            descricao: produto.descricao,
            quantidade: produto.quantidade.toString(),
            precoUnitario: produto.precoUnitario.toString(),
            codigo: produto.codigo
        });
        setEditingId(produto.id);
        setIsDialogOpen(true);
    };

    const handleDelete = (id) => {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            const updatedProdutos = produtos.filter(produto => produto.id !== id);
            saveProdutos(updatedProdutos);
        }
    };

    const getStockStatus = (quantidade) => {
        if (quantidade === 0) return { label: 'Sem estoque', variant: 'destructive' };
        if (quantidade <= 10) return { label: 'Estoque baixo', variant: 'secondary' };
        return { label: 'Em estoque', variant: 'default' };
    };

    const totalProdutos = produtos.length;
    const produtosSemEstoque = produtos.filter(p => p.quantidade === 0).length;
    const produtosEstoqueBaixo = produtos.filter(p => p.quantidade > 0 && p.quantidade <= 10).length;
    const valorTotalEstoque = produtos.reduce((total, p) => total + (p.quantidade * p.precoUnitario), 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Controle de Estoque</h1>
                    <p className="text-gray-600 mt-2">Gerencie seus produtos e quantidades</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Produto
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editingId ? 'Editar Produto' : 'Novo Produto'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingId ? 'Edite as informações do produto' : 'Adicione um novo produto ao estoque'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome</Label>
                                <Input
                                    id="nome"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                                    placeholder="Nome do produto"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="codigo">Código</Label>
                                <Input
                                    id="codigo"
                                    value={formData.codigo}
                                    onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                                    placeholder="Código do produto"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="descricao">Descrição</Label>
                                <Input
                                    id="descricao"
                                    value={formData.descricao}
                                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                                    placeholder="Descrição do produto"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="quantidade">Quantidade</Label>
                                    <Input
                                        id="quantidade"
                                        type="number"
                                        min="0"
                                        value={formData.quantidade}
                                        onChange={(e) => setFormData({...formData, quantidade: e.target.value})}
                                        placeholder="0"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="precoUnitario">Preço Unitário</Label>
                                    <Input
                                        id="precoUnitario"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.precoUnitario}
                                        onChange={(e) => setFormData({...formData, precoUnitario: e.target.value})}
                                        placeholder="0,00"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    {editingId ? 'Salvar' : 'Adicionar'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Cards de resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProdutos}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{produtosSemEstoque}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{produtosEstoqueBaixo}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {valorTotalEstoque.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabela de produtos */}
            <Card>
                <CardHeader>
                    <CardTitle>Produtos em Estoque</CardTitle>
                    <CardDescription>
                        {produtos.length} produto(s) cadastrado(s)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Código</TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Quantidade</TableHead>
                                    <TableHead>Preço Unitário</TableHead>
                                    <TableHead>Valor Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {produtos.map((produto) => {
                                    const stockStatus = getStockStatus(produto.quantidade);
                                    const valorTotal = produto.quantidade * produto.precoUnitario;
                                    
                                    return (
                                        <TableRow key={produto.id}>
                                            <TableCell className="font-medium">{produto.id}</TableCell>
                                            <TableCell>{produto.codigo}</TableCell>
                                            <TableCell>{produto.nome}</TableCell>
                                            <TableCell>{produto.descricao}</TableCell>
                                            <TableCell>{produto.quantidade}</TableCell>
                                            <TableCell>
                                                {produto.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </TableCell>
                                            <TableCell>
                                                {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={stockStatus.variant}>
                                                    {stockStatus.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(produto)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(produto.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

