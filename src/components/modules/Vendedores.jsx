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
import { Checkbox } from '@/components/ui/checkbox';
import { UserCheck, Plus, Edit, Trash2, Shield, User, AlertCircle, Stethoscope, ShoppingCart, Calendar } from 'lucide-react';
import '../../App.css';

export default function Vendedores() {
    const [usuarios, setUsuarios] = useState([]);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'vendedor',
        canSell: true,
        canProvideServices: false,
        specialization: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadUsuarios();
        migrateOldData();
    }, []);

    const migrateOldData = () => {
        // Migrar dados antigos de vendedores para usuarios
        const oldVendedores = JSON.parse(localStorage.getItem('vendedores')) || [];
        const existingUsuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        
        if (oldVendedores.length > 0 && existingUsuarios.length === 0) {
            const migratedUsuarios = oldVendedores.map(vendedor => ({
                ...vendedor,
                canSell: true,
                canProvideServices: false,
                specialization: ''
            }));
            localStorage.setItem('usuarios', JSON.stringify(migratedUsuarios));
            setUsuarios(migratedUsuarios);
        }
    };

    const loadUsuarios = () => {
        const data = JSON.parse(localStorage.getItem('usuarios')) || [];
        setUsuarios(data);
    };

    const saveUsuarios = (data) => {
        localStorage.setItem('usuarios', JSON.stringify(data));
        setUsuarios(data);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Nome de usuário é obrigatório';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Nome de usuário deve ter pelo menos 3 caracteres';
        } else {
            // Verificar se username já existe (exceto quando editando)
            const existingUser = usuarios.find(u => u.username === formData.username && u.id !== editingId);
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

        // Validar se pelo menos uma permissão foi selecionada
        if (!formData.canSell && !formData.canProvideServices && formData.role !== 'admin') {
            newErrors.permissions = 'Selecione pelo menos uma permissão (vendas ou serviços)';
        }

        // Validar especialização se pode fornecer serviços
        if (formData.canProvideServices && !formData.specialization.trim()) {
            newErrors.specialization = 'Especialização é obrigatória para profissionais que prestam serviços';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            username: '',
            password: '',
            confirmPassword: '',
            role: 'vendedor',
            canSell: true,
            canProvideServices: false,
            specialization: ''
        });
        setEditingId(null);
        setErrors({});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        const userData = {
            username: formData.username,
            role: formData.role,
            canSell: formData.role === 'admin' ? true : formData.canSell,
            canProvideServices: formData.role === 'admin' ? true : formData.canProvideServices,
            specialization: formData.canProvideServices ? formData.specialization : ''
        };

        // Incluir senha apenas se foi fornecida
        if (formData.password) {
            userData.password = formData.password;
        }

        let updatedUsuarios;
        
        if (editingId) {
            updatedUsuarios = usuarios.map(usuario => 
                usuario.id === editingId 
                    ? { ...usuario, ...userData }
                    : usuario
            );
        } else {
            const newId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
            updatedUsuarios = [...usuarios, { id: newId, ...userData, password: formData.password }];
        }
        
        saveUsuarios(updatedUsuarios);
        resetForm();
        setIsDialogOpen(false);
    };

    const handleEdit = (usuario) => {
        setFormData({
            username: usuario.username,
            password: '',
            confirmPassword: '',
            role: usuario.role,
            canSell: usuario.canSell || false,
            canProvideServices: usuario.canProvideServices || false,
            specialization: usuario.specialization || ''
        });
        setEditingId(usuario.id);
        setIsDialogOpen(true);
    };

    const handleDelete = (id) => {
        const usuario = usuarios.find(u => u.id === id);
        
        // Não permitir excluir se for o último admin
        if (usuario.role === 'admin') {
            const admins = usuarios.filter(u => u.role === 'admin');
            if (admins.length === 1) {
                alert('Não é possível excluir o último administrador do sistema.');
                return;
            }
        }

        if (confirm(`Tem certeza que deseja excluir o usuário "${usuario.username}"?`)) {
            const updatedUsuarios = usuarios.filter(usuario => usuario.id !== id);
            saveUsuarios(updatedUsuarios);
        }
    };

    const getVendasPorUsuario = () => {
        const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
        const vendasPorUsuario = {};
        
        usuarios.forEach(usuario => {
            vendasPorUsuario[usuario.id] = {
                quantidade: 0,
                total: 0
            };
        });

        vendas.forEach(venda => {
            if (vendasPorUsuario[venda.vendedorId]) {
                vendasPorUsuario[venda.vendedorId].quantidade += 1;
                vendasPorUsuario[venda.vendedorId].total += venda.total;
            }
        });

        return vendasPorUsuario;
    };

    const getAgendamentosPorUsuario = () => {
        const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
        const agendamentosPorUsuario = {};
        
        usuarios.forEach(usuario => {
            agendamentosPorUsuario[usuario.id] = 0;
        });

        agendamentos.forEach(agendamento => {
            // Buscar o serviço para encontrar o profissional responsável
            const servicos = JSON.parse(localStorage.getItem('servicos')) || [];
            const servico = servicos.find(s => s.id === agendamento.servicoId);
            if (servico && servico.profissionalId) {
                agendamentosPorUsuario[servico.profissionalId] = (agendamentosPorUsuario[servico.profissionalId] || 0) + 1;
            }
        });

        return agendamentosPorUsuario;
    };

    const vendasPorUsuario = getVendasPorUsuario();
    const agendamentosPorUsuario = getAgendamentosPorUsuario();
    const totalUsuarios = usuarios.length;
    const totalAdmins = usuarios.filter(u => u.role === 'admin').length;
    const totalVendedores = usuarios.filter(u => u.canSell && u.role !== 'admin').length;
    const totalProfissionais = usuarios.filter(u => u.canProvideServices && u.role !== 'admin').length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Usuários e Profissionais</h1>
                    <p className="text-gray-600 mt-2">Gerencie usuários, vendedores e profissionais do sistema</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Usuário
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editingId ? 'Editar Usuário' : 'Novo Usuário'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingId 
                                    ? 'Edite as informações do usuário e suas permissões.'
                                    : 'Adicione um novo usuário ao sistema com as permissões adequadas'
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
                                        <SelectItem value="vendedor">Usuário</SelectItem>
                                        <SelectItem value="admin">Administrador</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.role !== 'admin' && (
                                <div className="space-y-3">
                                    <Label>Permissões *</Label>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="canSell"
                                                checked={formData.canSell}
                                                onCheckedChange={(checked) => setFormData({...formData, canSell: checked})}
                                            />
                                            <Label htmlFor="canSell" className="flex items-center">
                                                <ShoppingCart className="h-4 w-4 mr-2" />
                                                Pode realizar vendas
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="canProvideServices"
                                                checked={formData.canProvideServices}
                                                onCheckedChange={(checked) => setFormData({...formData, canProvideServices: checked})}
                                            />
                                            <Label htmlFor="canProvideServices" className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Pode prestar serviços
                                            </Label>
                                        </div>
                                    </div>
                                    {errors.permissions && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>{errors.permissions}</AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            )}

                            {formData.canProvideServices && (
                                <div className="space-y-2">
                                    <Label htmlFor="specialization">Especialização *</Label>
                                    <Input
                                        id="specialization"
                                        value={formData.specialization}
                                        onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                                        placeholder="Ex: Cardiologia, Fisioterapia, Psicologia..."
                                    />
                                    {errors.specialization && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>{errors.specialization}</AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            )}

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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsuarios}</div>
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
                        <ShoppingCart className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{totalVendedores}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Profissionais</CardTitle>
                        <Stethoscope className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{totalProfissionais}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabela de usuários */}
            <Card>
                <CardHeader>
                    <CardTitle>Usuários do Sistema</CardTitle>
                    <CardDescription>
                        {usuarios.length} usuário(s) cadastrado(s)
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
                                    <TableHead>Permissões</TableHead>
                                    <TableHead>Especialização</TableHead>
                                    <TableHead>Vendas</TableHead>
                                    <TableHead>Agendamentos</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {usuarios.map((usuario) => {
                                    const vendas = vendasPorUsuario[usuario.id] || { quantidade: 0, total: 0 };
                                    const agendamentos = agendamentosPorUsuario[usuario.id] || 0;
                                    
                                    return (
                                        <TableRow key={usuario.id}>
                                            <TableCell className="font-medium">{usuario.id}</TableCell>
                                            <TableCell>{usuario.username}</TableCell>
                                            <TableCell>
                                                <Badge variant={usuario.role === 'admin' ? 'destructive' : 'default'}>
                                                    {usuario.role === 'admin' ? (
                                                        <>
                                                            <Shield className="h-3 w-3 mr-1" />
                                                            Admin
                                                        </>
                                                    ) : (
                                                        <>
                                                            <User className="h-3 w-3 mr-1" />
                                                            Usuário
                                                        </>
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {(usuario.canSell || usuario.role === 'admin') && (
                                                        <Badge variant="outline" className="text-xs">
                                                            <ShoppingCart className="h-3 w-3 mr-1" />
                                                            Vendas
                                                        </Badge>
                                                    )}
                                                    {(usuario.canProvideServices || usuario.role === 'admin') && (
                                                        <Badge variant="outline" className="text-xs">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            Serviços
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {usuario.specialization || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div>{vendas.quantidade} vendas</div>
                                                    <div className="text-muted-foreground">
                                                        R$ {vendas.total.toFixed(2)}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {agendamentos} agendamentos
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(usuario)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(usuario.id)}
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

