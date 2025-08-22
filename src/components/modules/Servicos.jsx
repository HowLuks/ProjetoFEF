import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Clock, User, Search, Plus, Edit, Trash2, Settings } from 'lucide-react';
import '../../App.css';

const Servicos = () => {
    const [servicos, setServicos] = useState([]);
    const [profissionais, setProfissionais] = useState([]);
    const [filtros, setFiltros] = useState({
        nome: '',
        profissional: ''
    });
    const [novoServico, setNovoServico] = useState({
        nome: '',
        duracao: '',
        profissional: '',
        preco: '',
        descricao: ''
    });
    const [editandoId, setEditandoId] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = () => {
        // Carregar serviços do localStorage
        const servicosSalvos = JSON.parse(localStorage.getItem('servicos')) || [];
        setServicos(servicosSalvos);

        // Carregar profissionais do localStorage (usuarios que podem prestar serviços)
        const usuariosSalvos = JSON.parse(localStorage.getItem('usuarios')) || [];
        const profissionaisDisponiveis = usuariosSalvos.filter(usuario => 
            usuario.canProvideServices || usuario.role === 'admin'
        );
        setProfissionais(profissionaisDisponiveis);

        // Se não houver serviços, criar alguns de demonstração
        if (servicosSalvos.length === 0 && profissionaisDisponiveis.length > 0) {
            const servicosDemo = [
                {
                    id: 1,
                    nome: 'Consulta Médica',
                    duracao: 30,
                    profissionalId: profissionaisDisponiveis[0].id,
                    profissional: profissionaisDisponiveis[0].username,
                    preco: 150.00,
                    descricao: 'Consulta médica geral'
                },
                {
                    id: 2,
                    nome: 'Exame de Rotina',
                    duracao: 45,
                    profissional: 'Dra. Maria Santos',
                    preco: 200.00,
                    descricao: 'Exame médico de rotina completo'
                },
                {
                    id: 3,
                    nome: 'Fisioterapia',
                    duracao: 60,
                    profissional: 'Dr. Pedro Costa',
                    preco: 120.00,
                    descricao: 'Sessão de fisioterapia'
                }
            ];
            setServicos(servicosDemo);
            localStorage.setItem('servicos', JSON.stringify(servicosDemo));
        }

        // Se não houver profissionais, criar alguns de demonstração
        if (vendedoresSalvos.length === 0) {
            const profissionaisDemo = [
                { id: 1, nome: 'Dr. João Silva', especialidade: 'Clínico Geral' },
                { id: 2, nome: 'Dra. Maria Santos', especialidade: 'Cardiologista' },
                { id: 3, nome: 'Dr. Pedro Costa', especialidade: 'Fisioterapeuta' },
                { id: 4, nome: 'Dra. Ana Oliveira', especialidade: 'Dermatologista' }
            ];
            setProfissionais(profissionaisDemo);
            localStorage.setItem('vendedores', JSON.stringify(profissionaisDemo));
        }
    };

    const salvarServico = () => {
        if (!novoServico.nome || !novoServico.duracao || !novoServico.profissional || !novoServico.preco) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        let servicosAtualizados;
        
        if (editandoId) {
            // Editando serviço existente
            servicosAtualizados = servicos.map(servico =>
                servico.id === editandoId ? { 
                    ...novoServico, 
                    id: editandoId,
                    duracao: parseInt(novoServico.duracao),
                    preco: parseFloat(novoServico.preco)
                } : servico
            );
        } else {
            // Criando novo serviço
            const novoId = Math.max(...servicos.map(s => s.id), 0) + 1;
            servicosAtualizados = [...servicos, { 
                ...novoServico, 
                id: novoId,
                duracao: parseInt(novoServico.duracao),
                preco: parseFloat(novoServico.preco)
            }];
        }

        setServicos(servicosAtualizados);
        localStorage.setItem('servicos', JSON.stringify(servicosAtualizados));
        
        // Limpar formulário
        setNovoServico({
            nome: '',
            duracao: '',
            profissional: '',
            preco: '',
            descricao: ''
        });
        setEditandoId(null);
        setMostrarFormulario(false);
    };

    const editarServico = (servico) => {
        setNovoServico({
            nome: servico.nome,
            duracao: servico.duracao.toString(),
            profissional: servico.profissional,
            preco: servico.preco.toString(),
            descricao: servico.descricao || ''
        });
        setEditandoId(servico.id);
        setMostrarFormulario(true);
    };

    const excluirServico = (id) => {
        if (confirm('Tem certeza que deseja excluir este serviço?')) {
            const servicosAtualizados = servicos.filter(servico => servico.id !== id);
            setServicos(servicosAtualizados);
            localStorage.setItem('servicos', JSON.stringify(servicosAtualizados));
        }
    };

    const servicosFiltrados = servicos.filter(servico => {
        const matchNome = !filtros.nome || servico.nome.toLowerCase().includes(filtros.nome.toLowerCase());
        const matchProfissional = !filtros.profissional || filtros.profissional === 'todos' || servico.profissional === filtros.profissional;
        return matchNome && matchProfissional;
    });

    const formatarPreco = (preco) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(preco);
    };

    const formatarDuracao = (duracao) => {
        if (duracao >= 60) {
            const horas = Math.floor(duracao / 60);
            const minutos = duracao % 60;
            return minutos > 0 ? `${horas}h ${minutos}min` : `${horas}h`;
        }
        return `${duracao}min`;
    };

    // Estatísticas
    const totalServicos = servicos.length;
    const duracaoMedia = servicos.length > 0 ? Math.round(servicos.reduce((acc, s) => acc + s.duracao, 0) / servicos.length) : 0;
    const precoMedio = servicos.length > 0 ? servicos.reduce((acc, s) => acc + s.preco, 0) / servicos.length : 0;
    const profissionaisUnicos = [...new Set(servicos.map(s => s.profissional))].length;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Gerenciamento de Serviços</h2>
                <p className="text-muted-foreground">
                    Gerencie os serviços oferecidos e seus profissionais responsáveis
                </p>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Serviços</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalServicos}</div>
                        <p className="text-xs text-muted-foreground">
                            serviços cadastrados
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatarDuracao(duracaoMedia)}</div>
                        <p className="text-xs text-muted-foreground">
                            tempo médio por serviço
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Preço Médio</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatarPreco(precoMedio)}</div>
                        <p className="text-xs text-muted-foreground">
                            valor médio dos serviços
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Profissionais</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{profissionaisUnicos}</div>
                        <p className="text-xs text-muted-foreground">
                            profissionais ativos
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros e Novo Serviço */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Filtros e Ações
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <Label htmlFor="filtro-nome">Nome do Serviço</Label>
                            <Input
                                id="filtro-nome"
                                placeholder="Buscar por nome..."
                                value={filtros.nome}
                                onChange={(e) => setFiltros({ ...filtros, nome: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="filtro-profissional">Profissional</Label>
                            <Select value={filtros.profissional} onValueChange={(value) => setFiltros({ ...filtros, profissional: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos os profissionais" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos</SelectItem>
                                    {profissionais.map((prof) => (
                                        <SelectItem key={prof.id} value={prof.nome}>
                                            {prof.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button 
                                onClick={() => setMostrarFormulario(!mostrarFormulario)}
                                className="w-full"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Novo Serviço
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Formulário de Novo/Editar Serviço */}
            {mostrarFormulario && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {editandoId ? 'Editar Serviço' : 'Novo Serviço'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="nome">Nome do Serviço *</Label>
                                <Input
                                    id="nome"
                                    placeholder="Ex: Consulta Médica"
                                    value={novoServico.nome}
                                    onChange={(e) => setNovoServico({ ...novoServico, nome: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="duracao">Duração (minutos) *</Label>
                                <Input
                                    id="duracao"
                                    type="number"
                                    placeholder="Ex: 30"
                                    value={novoServico.duracao}
                                    onChange={(e) => setNovoServico({ ...novoServico, duracao: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="profissional">Profissional Responsável *</Label>
                                <Select value={novoServico.profissional} onValueChange={(value) => setNovoServico({ ...novoServico, profissional: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um profissional" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {profissionais.map((prof) => (
                                            <SelectItem key={prof.id} value={prof.nome}>
                                                {prof.nome} - {prof.especialidade}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="preco">Preço (R$) *</Label>
                                <Input
                                    id="preco"
                                    type="number"
                                    step="0.01"
                                    placeholder="Ex: 150.00"
                                    value={novoServico.preco}
                                    onChange={(e) => setNovoServico({ ...novoServico, preco: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="descricao">Descrição</Label>
                            <Textarea
                                id="descricao"
                                placeholder="Descrição do serviço..."
                                value={novoServico.descricao}
                                onChange={(e) => setNovoServico({ ...novoServico, descricao: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={salvarServico}>
                                {editandoId ? 'Atualizar' : 'Salvar'} Serviço
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setMostrarFormulario(false);
                                    setEditandoId(null);
                                    setNovoServico({
                                        nome: '',
                                        duracao: '',
                                        profissional: '',
                                        preco: '',
                                        descricao: ''
                                    });
                                }}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Lista de Serviços */}
            <Card>
                <CardHeader>
                    <CardTitle>Serviços Cadastrados</CardTitle>
                    <CardDescription>
                        {servicosFiltrados.length} serviço(s) encontrado(s)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {servicosFiltrados.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                Nenhum serviço encontrado.
                            </p>
                        ) : (
                            servicosFiltrados.map((servico) => (
                                <div key={servico.id} className="border rounded-lg p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Settings className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{servico.nome}</span>
                                            <span className="text-lg font-bold text-green-600">
                                                {formatarPreco(servico.preco)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => editarServico(servico)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => excluirServico(servico.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="grid gap-2 md:grid-cols-3 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {formatarDuracao(servico.duracao)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {servico.profissional}
                                        </div>
                                        <div>
                                            <strong>ID:</strong> #{servico.id}
                                        </div>
                                    </div>
                                    {servico.descricao && (
                                        <div className="text-sm text-muted-foreground">
                                            <strong>Descrição:</strong> {servico.descricao}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Servicos;

