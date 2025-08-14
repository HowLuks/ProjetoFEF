import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserCheck, Plus, Edit, Trash2, Shield, User, AlertCircle } from 'lucide-react';
import '../../App.css';

export default function Vendedores() {
    const [vendedores, setVendedores] = useState([]);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'vendedor'
    });
    const [editingId, setEditingId] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadVendedores();
    }, []);

    const loadVendedores = () => {
        const data = JSON.parse(localStorage.getItem('vendedores')) || [];
        setVendedores(data);
    };

    const saveVendedores = (data) => {
        localStorage.setItem('vendedores', JSON.stringify(data));
        setVendedores(data);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Nome de usuário é obrigatório';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Nome de usuário deve ter pelo menos 3 caracteres';
        } else {
            // Verificar se username já existe (exceto quando editando)
            const existingUser = vendedores.find(v => v.username === formData.username && v.id !== editingId);
            if (existingUser) {
                newErrors.username = 'Este nome de usuário já está em uso';
            }
        }

        if (!editingId) { // Apenas validar senha ao criar novo usuário
            if (!formData.password) {
                newErrors.password = 'Senha é obrigatória';
            } else if (formData.password.length < 3) {
                newErrors.password = 'Senha deve ter pelo menos 3 caracteres';
            }

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Confirmação de senha não confere';
            }
        } else if (formData.password) { // Se editando e senha foi preenchida
            if (formData.password.length < 3) {
                newErrors.password = 'Senha deve ter pelo menos 3 caracteres';
            }
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Confirmação de senha não confere';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            username: '',
            password: '',
            confirmPassword: '',
            role: 'vendedor'
        });
        setEditingId(null);
        setErrors({});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        const vendedorData = {
            username: formData.username,
            role: formData.role
        };

        // Incluir senha apenas se foi fornecida
        if (formData.password) {
            vendedorData.password = formData.password;
        }

        let updatedVendedores;
        
        if (editingId) {
            updatedVendedores = vendedores.map(vendedor => 
                vendedor.id === editingId 
                    ? { ...vendedor, ...vendedorData }
                    : vendedor
            );
        } else {
            const newId = vendedores.length > 0 ? Math.max(...vendedores.map(v => v.id)) + 1 : 1;
            updatedVendedores = [...vendedores, { id: newId, ...vendedorData, password: formData.password }];
        }
        
        saveVendedores(updatedVendedores);
        resetForm();
        setIsDialogOpen(false);
    };

    const handleEdit = (vendedor) => {
        setFormData({
            username: vendedor.username,
            password: '',
            confirmPassword: '',
            role: vendedor.role
        });
        setEditingId(vendedor.id);
        setIsDialogOpen(true);
    };

    const handleDelete = (id) => {
        const vendedor = vendedores.find(v => v.id === id);
        
        // Não permitir excluir se for o último admin
        if (vendedor.role === 'admin') {
            const admins = vendedores.filter(v => v.role === 'admin');
            if (admins.length === 1) {
                alert('Não é possível excluir o último administrador do sistema.');
                return;
            }
        }

        if (confirm(`Tem certeza que deseja excluir o usuário "${vendedor.username}"?`)) {
            const updatedVendedores = vendedores.filter(vendedor => vendedor.id !== id);
            saveVendedores(updatedVendedores);
        }
    };

    const getVendasPorVendedor = () => {
        const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
        const vendasPorVendedor = {};
        
        vendedores.forEach(vendedor => {
            vendasPorVendedor[vendedor.id] = {
                quantidade: 0,
                total: 0
            };
        });

        vendas.forEach(venda => {
            if (vendasPorVendedor[venda.vendedorId]) {
                vendasPorVendedor[venda.vendedorId].quantidade += 1;
                vendasPorVendedor[venda.vendedorId].total += venda.total;
            }
        });

        return vendasPorVendedor;
    };

    const vendasPorVendedor = getVendasPorVendedor();
    const totalVendedores = vendedores.length;
    const totalAdmins = vendedores.filter(v => v.role === 'admin').length;
    const totalVendedoresAtivos = vendedores.filter(v => v.role === 'vendedor').length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Contas de Vendedores</h1>
                    <p className="text-gray-600 mt-2">Gerencie usuários e permissões do sistema</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Usuário
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editingId ? 'Editar Usuário' : 'Novo Usuário'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingId 
                                    ? 'Edite as informações do usuário. Deixe a senha em branco para mantê-la inalterada.'
                                    : 'Adicione um novo usuário ao sistema'
                                }
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Nome de Usuário *</Label>
                                <Input
                                    id="username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    placeholder="Nome de usuário"
                                />
                                {errors.username && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{errors.username}</AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Tipo de Usuário</Label>
                                <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="vendedor">Vendedor</SelectItem>
                                        <SelectItem value="admin">Administrador</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    {editingId ? 'Nova Senha (opcional)' : 'Senha *'}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    placeholder={editingId ? 'Deixe em branco para manter a atual' : 'Senha'}
                                />
                                {errors.password && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{errors.password}</AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">
                                    {editingId ? 'Confirmar Nova Senha' : 'Confirmar Senha *'}
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                    placeholder="Confirme a senha"
                                />
                                {errors.confirmPassword && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{errors.confirmPassword}</AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    {editingId ? 'Salvar' : 'Criar'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Cards de resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalVendedores}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Administradores</CardTitle>
                        <Shield className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{totalAdmins}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vendedores</CardTitle>
                        <User className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{totalVendedoresAtivos}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabela de usuários */}
            <Card>
                <CardHeader>
                    <CardTitle>Usuários do Sistema</CardTitle>
                    <CardDescription>
                        {vendedores.length} usuário(s) cadastrado(s)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Usuário</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Vendas</TableHead>
                                    <TableHead>Faturamento</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vendedores.map((vendedor) => {
                                    const vendas = vendasPorVendedor[vendedor.id] || { quantidade: 0, total: 0 };
                                    
                                    return (
                                        <TableRow key={vendedor.id}>
                                            <TableCell className="font-medium">{vendedor.id}</TableCell>
                                            <TableCell>{vendedor.username}</TableCell>
                                            <TableCell>
                                                <Badge variant={vendedor.role === 'admin' ? 'destructive' : 'default'}>
                                                    {vendedor.role === 'admin' ? (
                                                        <>
                                                            <Shield className="h-3 w-3 mr-1" />
                                                            Administrador
                                                        </>
                                                    ) : (
                                                        <>
                                                            <User className="h-3 w-3 mr-1" />
                                                            Vendedor
                                                        </>
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">{vendas.quantidade}</span> vendas
                                            </TableCell>
                                            <TableCell className="text-green-600 font-medium">
                                                {vendas.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(vendedor)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(vendedor.id)}
                                                        disabled={vendedor.role === 'admin' && totalAdmins === 1}
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

            {/* Informações importantes */}
            <Card>
                <CardHeader>
                    <CardTitle>Informações Importantes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex items-start space-x-2">
                        <Shield className="h-4 w-4 text-red-600 mt-0.5" />
                        <p className="text-sm text-gray-600">
                            <strong>Administradores</strong> têm acesso completo ao sistema, incluindo este módulo de gerenciamento de usuários.
                        </p>
                    </div>
                    <div className="flex items-start space-x-2">
                        <User className="h-4 w-4 text-blue-600 mt-0.5" />
                        <p className="text-sm text-gray-600">
                            <strong>Vendedores</strong> têm acesso aos módulos de vendas, estoque, clientes e relatórios básicos.
                        </p>
                    </div>
                    <div className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <p className="text-sm text-gray-600">
                            O sistema deve ter pelo menos um administrador. Não é possível excluir o último admin.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

