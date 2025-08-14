import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Plus, Edit, Trash2, UserCheck, AlertCircle } from 'lucide-react';
import { formatDateToDDMMYYYY, formatDateToYYYYMMDD } from '../../utils/dateUtils';
import '../../App.css';

export default function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [formData, setFormData] = useState({
        nome: '',
        cpf: '',
        email: '',
        telefone: '',
        dataNascimento: '',
        isMenorIdade: false,
        nomeResponsavel: '',
        cpfResponsavel: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadClientes();
    }, []);

    const loadClientes = () => {
        const data = JSON.parse(localStorage.getItem('clientes')) || [];
        setClientes(data);
    };

    const saveClientes = (data) => {
        localStorage.setItem('clientes', JSON.stringify(data));
        setClientes(data);
    };

    const validateCPF = (cpf) => {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
        
        let sum = 0;
        let remainder;
        
        for (let i = 1; i <= 9; i++) {
            sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;
        
        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }
        remainder = (sum * 10) % 11;
        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;
        
        return true;
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const formatCPF = (cpf) => {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length <= 11) {
            return cpf.replace(/(\d{3})(\d)/, '$1.$2')
                      .replace(/(\d{3})(\d)/, '$1.$2')
                      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        }
        return cpf;
    };

    const formatTelefone = (telefone) => {
        telefone = telefone.replace(/\D/g, '');
        if (telefone.length === 11) {
            return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (telefone.length === 10) {
            return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return telefone;
    };

    const calculateAge = (dataNascimento) => {
        if (!dataNascimento) return 0;
        const [day, month, year] = dataNascimento.split('/');
        const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const resetForm = () => {
        setFormData({
            nome: '',
            cpf: '',
            email: '',
            telefone: '',
            dataNascimento: '',
            isMenorIdade: false,
            nomeResponsavel: '',
            cpfResponsavel: ''
        });
        setEditingId(null);
        setErrors({});
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
        if (!formData.cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
        else if (!validateCPF(formData.cpf)) newErrors.cpf = 'CPF inválido';
        
        if (!formData.email.trim()) newErrors.email = 'E-mail é obrigatório';
        else if (!validateEmail(formData.email)) newErrors.email = 'E-mail inválido';
        
        if (!formData.dataNascimento) newErrors.dataNascimento = 'Data de nascimento é obrigatória';

        if (formData.isMenorIdade) {
            if (!formData.nomeResponsavel.trim()) newErrors.nomeResponsavel = 'Nome do responsável é obrigatório';
            if (!formData.cpfResponsavel.trim()) newErrors.cpfResponsavel = 'CPF do responsável é obrigatório';
            else if (!validateCPF(formData.cpfResponsavel)) newErrors.cpfResponsavel = 'CPF do responsável inválido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        const clienteData = {
            nome: formData.nome,
            cpf: formatCPF(formData.cpf),
            email: formData.email,
            telefone: formatTelefone(formData.telefone),
            dataNascimento: formatDateToDDMMYYYY(formData.dataNascimento)
        };

        if (formData.isMenorIdade) {
            clienteData.responsavel = {
                nome: formData.nomeResponsavel,
                cpf: formatCPF(formData.cpfResponsavel)
            };
        }

        let updatedClientes;
        
        if (editingId) {
            updatedClientes = clientes.map(cliente => 
                cliente.id === editingId 
                    ? { ...cliente, ...clienteData }
                    : cliente
            );
        } else {
            const newId = clientes.length > 0 ? Math.max(...clientes.map(c => c.id)) + 1 : 1;
            updatedClientes = [...clientes, { id: newId, ...clienteData }];
        }
        
        saveClientes(updatedClientes);
        resetForm();
        setIsDialogOpen(false);
    };

    const handleEdit = (cliente) => {
        setFormData({
            nome: cliente.nome,
            cpf: cliente.cpf,
            email: cliente.email,
            telefone: cliente.telefone,
            dataNascimento: formatDateToYYYYMMDD(cliente.dataNascimento),
            isMenorIdade: !!cliente.responsavel,
            nomeResponsavel: cliente.responsavel?.nome || '',
            cpfResponsavel: cliente.responsavel?.cpf || ''
        });
        setEditingId(cliente.id);
        setIsDialogOpen(true);
    };

    const handleDelete = (id) => {
        if (confirm('Tem certeza que deseja excluir este cliente?')) {
            const updatedClientes = clientes.filter(cliente => cliente.id !== id);
            saveClientes(updatedClientes);
        }
    };

    const handleCPFChange = (value, field) => {
        const formatted = formatCPF(value);
        setFormData({ ...formData, [field]: formatted });
        
        // Limpar erro se CPF se tornar válido
        if (validateCPF(formatted)) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const handleEmailChange = (value) => {
        setFormData({ ...formData, email: value });
        
        // Limpar erro se email se tornar válido
        if (validateEmail(value)) {
            setErrors({ ...errors, email: '' });
        }
    };

    const handleDateChange = (value) => {
        setFormData({ ...formData, dataNascimento: value });
        
        // Verificar se é menor de idade automaticamente
        const age = calculateAge(formatDateToDDMMYYYY(value));
        if (age < 18 && age > 0) {
            setFormData(prev => ({ ...prev, dataNascimento: value, isMenorIdade: true }));
        }
    };

    const totalClientes = clientes.length;
    const clientesMenores = clientes.filter(c => c.responsavel).length;
    const clientesMaiores = totalClientes - clientesMenores;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Cadastro de Clientes</h1>
                    <p className="text-gray-600 mt-2">Gerencie o cadastro dos seus clientes</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Cliente
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingId ? 'Editar Cliente' : 'Novo Cliente'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingId ? 'Edite as informações do cliente' : 'Adicione um novo cliente ao sistema'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome *</Label>
                                <Input
                                    id="nome"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                                    placeholder="Nome completo"
                                />
                                {errors.nome && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{errors.nome}</AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cpf">CPF *</Label>
                                    <Input
                                        id="cpf"
                                        value={formData.cpf}
                                        onChange={(e) => handleCPFChange(e.target.value, 'cpf')}
                                        placeholder="000.000.000-00"
                                        maxLength={14}
                                    />
                                    {errors.cpf && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>{errors.cpf}</AlertDescription>
                                        </Alert>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                                    <Input
                                        id="dataNascimento"
                                        type="date"
                                        value={formData.dataNascimento}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                    />
                                    {errors.dataNascimento && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>{errors.dataNascimento}</AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleEmailChange(e.target.value)}
                                    placeholder="email@exemplo.com"
                                />
                                {errors.email && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{errors.email}</AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telefone">Telefone</Label>
                                <Input
                                    id="telefone"
                                    value={formData.telefone}
                                    onChange={(e) => setFormData({...formData, telefone: formatTelefone(e.target.value)})}
                                    placeholder="(00) 00000-0000"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isMenorIdade"
                                    checked={formData.isMenorIdade}
                                    onCheckedChange={(checked) => setFormData({...formData, isMenorIdade: checked})}
                                />
                                <Label htmlFor="isMenorIdade">Menor de 18 anos</Label>
                            </div>

                            {formData.isMenorIdade && (
                                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium text-gray-900">Dados do Responsável</h4>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="nomeResponsavel">Nome do Responsável *</Label>
                                        <Input
                                            id="nomeResponsavel"
                                            value={formData.nomeResponsavel}
                                            onChange={(e) => setFormData({...formData, nomeResponsavel: e.target.value})}
                                            placeholder="Nome completo do responsável"
                                        />
                                        {errors.nomeResponsavel && (
                                            <Alert variant="destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>{errors.nomeResponsavel}</AlertDescription>
                                            </Alert>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cpfResponsavel">CPF do Responsável *</Label>
                                        <Input
                                            id="cpfResponsavel"
                                            value={formData.cpfResponsavel}
                                            onChange={(e) => handleCPFChange(e.target.value, 'cpfResponsavel')}
                                            placeholder="000.000.000-00"
                                            maxLength={14}
                                        />
                                        {errors.cpfResponsavel && (
                                            <Alert variant="destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>{errors.cpfResponsavel}</AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                </div>
                            )}

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalClientes}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Clientes Maiores</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{clientesMaiores}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Clientes Menores</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{clientesMenores}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabela de clientes */}
            <Card>
                <CardHeader>
                    <CardTitle>Clientes Cadastrados</CardTitle>
                    <CardDescription>
                        {clientes.length} cliente(s) cadastrado(s)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>CPF</TableHead>
                                    <TableHead>E-mail</TableHead>
                                    <TableHead>Telefone</TableHead>
                                    <TableHead>Data Nasc.</TableHead>
                                    <TableHead>Idade</TableHead>
                                    <TableHead>Responsável</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clientes.map((cliente) => {
                                    const idade = calculateAge(cliente.dataNascimento);
                                    
                                    return (
                                        <TableRow key={cliente.id}>
                                            <TableCell className="font-medium">{cliente.id}</TableCell>
                                            <TableCell>{cliente.nome}</TableCell>
                                            <TableCell>{cliente.cpf}</TableCell>
                                            <TableCell>{cliente.email}</TableCell>
                                            <TableCell>{cliente.telefone}</TableCell>
                                            <TableCell>{cliente.dataNascimento}</TableCell>
                                            <TableCell>
                                                <Badge variant={idade < 18 ? 'secondary' : 'default'}>
                                                    {idade} anos
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {cliente.responsavel ? (
                                                    <div className="text-sm">
                                                        <div>{cliente.responsavel.nome}</div>
                                                        <div className="text-gray-500">{cliente.responsavel.cpf}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">N/A</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(cliente)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(cliente.id)}
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

