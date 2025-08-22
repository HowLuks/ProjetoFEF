import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, User, Search, Plus, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatDateToDDMMYYYY, getCurrentDateYYYYMMDD } from '../../utils/dateUtils';
import '../../App.css';

const Agendamentos = () => {
    const [agendamentos, setAgendamentos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [servicos, setServicos] = useState([]);
    const [filtros, setFiltros] = useState({
        cliente: '',
        data: '',
        status: ''
    });
    const [novoAgendamento, setNovoAgendamento] = useState({
        cliente: '',
        servico: '',
        data: '',
        hora: '',
        observacoes: '',
        status: 'agendado'
    });
    const [editandoId, setEditandoId] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = () => {
        // Carregar agendamentos do localStorage
        const agendamentosSalvos = JSON.parse(localStorage.getItem('agendamentos')) || [];
        setAgendamentos(agendamentosSalvos);

        // Carregar clientes do localStorage
        const clientesSalvos = JSON.parse(localStorage.getItem('clientes')) || [];
        setClientes(clientesSalvos);

        // Carregar serviços do localStorage
        const servicosSalvos = JSON.parse(localStorage.getItem('servicos')) || [];
        setServicos(servicosSalvos);

        // Se não houver agendamentos, criar alguns de demonstração
        if (agendamentosSalvos.length === 0) {
            const agendamentosDemo = [
                {
                    id: 1,
                    cliente: 'João Silva',
                    servico: 'Consulta Médica',
                    data: '2025-08-14',
                    hora: '09:00',
                    observacoes: 'Primeira consulta',
                    status: 'agendado'
                },
                {
                    id: 2,
                    cliente: 'Maria Santos',
                    servico: 'Exame de Rotina',
                    data: '2025-08-14',
                    hora: '14:30',
                    observacoes: 'Discussão sobre projeto',
                    status: 'confirmado'
                },
                {
                    id: 3,
                    cliente: 'Pedro Costa',
                    servico: 'Fisioterapia',
                    data: '2025-08-15',
                    hora: '10:00',
                    observacoes: '',
                    status: 'agendado'
                }
            ];
            setAgendamentos(agendamentosDemo);
            localStorage.setItem('agendamentos', JSON.stringify(agendamentosDemo));
        }
    };

    const verificarConflito = (novoAgend, servicoSelecionado) => {
        // Converter horário para minutos para facilitar cálculos
        const horaParaMinutos = (hora) => {
            const [h, m] = hora.split(':').map(Number);
            return h * 60 + m;
        };

        // Converter minutos de volta para horário
        const minutosParaHora = (minutos) => {
            const h = Math.floor(minutos / 60);
            const m = minutos % 60;
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        };

        const novoInicio = horaParaMinutos(novoAgend.hora);
        const novoFim = novoInicio + servicoSelecionado.duracao;

        // Verificar conflitos com agendamentos existentes
        for (const agendamento of agendamentos) {
            // Pular se for o mesmo agendamento sendo editado
            if (editandoId && agendamento.id === editandoId) {
                continue;
            }

            // Verificar se é o mesmo serviço, mesmo profissional e mesma data
            if (agendamento.servico === novoAgend.servico && 
                agendamento.data === novoAgend.data &&
                agendamento.status !== 'cancelado') {
                
                const servicoExistente = servicos.find(s => s.nome === agendamento.servico);
                if (servicoExistente && servicoExistente.profissional === servicoSelecionado.profissional) {
                    const existenteInicio = horaParaMinutos(agendamento.hora);
                    const existenteFim = existenteInicio + servicoExistente.duracao;

                    // Verificar sobreposição de horários
                    if ((novoInicio < existenteFim && novoFim > existenteInicio)) {
                        return {
                            data: agendamento.data,
                            hora: agendamento.hora,
                            servico: agendamento.servico
                        };
                    }
                }
            }
        }

        return null;
    };

    const salvarAgendamento = () => {
        if (!novoAgendamento.cliente || !novoAgendamento.servico || !novoAgendamento.data || !novoAgendamento.hora) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        // Validação de conflito de agendamento
        const servicoSelecionado = servicos.find(s => s.nome === novoAgendamento.servico);
        if (servicoSelecionado) {
            const conflito = verificarConflito(novoAgendamento, servicoSelecionado);
            if (conflito) {
                alert(`Conflito de agendamento detectado! O profissional ${servicoSelecionado.profissional} já possui um agendamento do serviço "${novoAgendamento.servico}" no horário ${conflito.hora} do dia ${formatDateToDDMMYYYY(conflito.data)}.`);
                return;
            }
        }

        let agendamentosAtualizados;
        
        if (editandoId) {
            // Editando agendamento existente
            agendamentosAtualizados = agendamentos.map(agendamento =>
                agendamento.id === editandoId ? { ...novoAgendamento, id: editandoId } : agendamento
            );
        } else {
            // Criando novo agendamento
            const novoId = Math.max(...agendamentos.map(a => a.id), 0) + 1;
            agendamentosAtualizados = [...agendamentos, { ...novoAgendamento, id: novoId }];
        }

        setAgendamentos(agendamentosAtualizados);
        localStorage.setItem('agendamentos', JSON.stringify(agendamentosAtualizados));
        
        // Limpar formulário
        setNovoAgendamento({
            cliente: '',
            servico: '',
            data: '',
            hora: '',
            observacoes: '',
            status: 'agendado'
        });
        setEditandoId(null);
        setMostrarFormulario(false);
    };

    const editarAgendamento = (agendamento) => {
        setNovoAgendamento(agendamento);
        setEditandoId(agendamento.id);
        setMostrarFormulario(true);
    };

    const excluirAgendamento = (id) => {
        if (confirm('Tem certeza que deseja excluir este agendamento?')) {
            const agendamentosAtualizados = agendamentos.filter(agendamento => agendamento.id !== id);
            setAgendamentos(agendamentosAtualizados);
            localStorage.setItem('agendamentos', JSON.stringify(agendamentosAtualizados));
        }
    };

    const alterarStatus = (id, novoStatus) => {
        const agendamentosAtualizados = agendamentos.map(agendamento =>
            agendamento.id === id ? { ...agendamento, status: novoStatus } : agendamento
        );
        setAgendamentos(agendamentosAtualizados);
        localStorage.setItem('agendamentos', JSON.stringify(agendamentosAtualizados));
    };

    const agendamentosFiltrados = agendamentos.filter(agendamento => {
        const matchCliente = !filtros.cliente || agendamento.cliente.toLowerCase().includes(filtros.cliente.toLowerCase());
        const matchData = !filtros.data || agendamento.data === filtros.data;
        const matchStatus = !filtros.status || filtros.status === 'todos' || agendamento.status === filtros.status;
        return matchCliente && matchData && matchStatus;
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'confirmado':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'cancelado':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmado':
                return 'bg-green-100 text-green-800';
            case 'cancelado':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    // Estatísticas
    const hoje = getCurrentDateYYYYMMDD();
    const agendamentosHoje = agendamentos.filter(a => a.data === hoje).length;
    const agendamentosConfirmados = agendamentos.filter(a => a.status === 'confirmado').length;
    const agendamentosCancelados = agendamentos.filter(a => a.status === 'cancelado').length;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Agendamento de Horários</h2>
                <p className="text-muted-foreground">
                    Gerencie seus compromissos e horários de forma eficiente
                </p>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hoje</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{agendamentosHoje}</div>
                        <p className="text-xs text-muted-foreground">
                            agendamentos para hoje
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{agendamentos.length}</div>
                        <p className="text-xs text-muted-foreground">
                            agendamentos totais
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{agendamentosConfirmados}</div>
                        <p className="text-xs text-muted-foreground">
                            agendamentos confirmados
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{agendamentosCancelados}</div>
                        <p className="text-xs text-muted-foreground">
                            agendamentos cancelados
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros e Novo Agendamento */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Filtros e Ações
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div>
                            <Label htmlFor="filtro-cliente">Cliente</Label>
                            <Input
                                id="filtro-cliente"
                                placeholder="Buscar por cliente..."
                                value={filtros.cliente}
                                onChange={(e) => setFiltros({ ...filtros, cliente: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="filtro-data">Data</Label>
                            <Input
                                id="filtro-data"
                                type="date"
                                value={filtros.data}
                                onChange={(e) => setFiltros({ ...filtros, data: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="filtro-status">Status</Label>
                            <Select value={filtros.status} onValueChange={(value) => setFiltros({ ...filtros, status: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos os status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos</SelectItem>
                                    <SelectItem value="agendado">Agendado</SelectItem>
                                    <SelectItem value="confirmado">Confirmado</SelectItem>
                                    <SelectItem value="cancelado">Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button 
                                onClick={() => setMostrarFormulario(!mostrarFormulario)}
                                className="w-full"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Novo Agendamento
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Formulário de Novo/Editar Agendamento */}
            {mostrarFormulario && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {editandoId ? 'Editar Agendamento' : 'Novo Agendamento'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="cliente">Cliente *</Label>
                                <Input
                                    id="cliente"
                                    placeholder="Nome do cliente"
                                    value={novoAgendamento.cliente}
                                    onChange={(e) => setNovoAgendamento({ ...novoAgendamento, cliente: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="servico">Serviço *</Label>
                                <Select value={novoAgendamento.servico} onValueChange={(value) => setNovoAgendamento({ ...novoAgendamento, servico: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um serviço" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {servicos.map((servico) => (
                                            <SelectItem key={servico.id} value={servico.nome}>
                                                {servico.nome} - {servico.duracao}min - {servico.profissional}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="data">Data *</Label>
                                <Input
                                    id="data"
                                    type="date"
                                    value={novoAgendamento.data}
                                    onChange={(e) => setNovoAgendamento({ ...novoAgendamento, data: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="hora">Hora *</Label>
                                <Input
                                    id="hora"
                                    type="time"
                                    value={novoAgendamento.hora}
                                    onChange={(e) => setNovoAgendamento({ ...novoAgendamento, hora: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select value={novoAgendamento.status} onValueChange={(value) => setNovoAgendamento({ ...novoAgendamento, status: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="agendado">Agendado</SelectItem>
                                        <SelectItem value="confirmado">Confirmado</SelectItem>
                                        <SelectItem value="cancelado">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="observacoes">Observações</Label>
                            <Textarea
                                id="observacoes"
                                placeholder="Observações adicionais..."
                                value={novoAgendamento.observacoes}
                                onChange={(e) => setNovoAgendamento({ ...novoAgendamento, observacoes: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={salvarAgendamento}>
                                {editandoId ? 'Atualizar' : 'Salvar'} Agendamento
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setMostrarFormulario(false);
                                    setEditandoId(null);
                                    setNovoAgendamento({
                                        cliente: '',
                                        servico: '',
                                        data: '',
                                        hora: '',
                                        observacoes: '',
                                        status: 'agendado'
                                    });
                                }}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Lista de Agendamentos */}
            <Card>
                <CardHeader>
                    <CardTitle>Agendamentos</CardTitle>
                    <CardDescription>
                        {agendamentosFiltrados.length} agendamento(s) encontrado(s)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {agendamentosFiltrados.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                Nenhum agendamento encontrado.
                            </p>
                        ) : (
                            agendamentosFiltrados.map((agendamento) => (
                                <div key={agendamento.id} className="border rounded-lg p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{agendamento.cliente}</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                                                {agendamento.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => editarAgendamento(agendamento)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => excluirAgendamento(agendamento.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="grid gap-2 md:grid-cols-3 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDateToDDMMYYYY(agendamento.data)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {agendamento.hora}
                                        </div>
                                        <div>
                                            <strong>Serviço:</strong> {agendamento.servico}
                                        </div>
                                    </div>
                                    {agendamento.observacoes && (
                                        <div className="text-sm text-muted-foreground">
                                            <strong>Observações:</strong> {agendamento.observacoes}
                                        </div>
                                    )}
                                    <div className="flex gap-2 pt-2">
                                        {agendamento.status !== 'confirmado' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => alterarStatus(agendamento.id, 'confirmado')}
                                                className="text-green-600 hover:text-green-700"
                                            >
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Confirmar
                                            </Button>
                                        )}
                                        {agendamento.status !== 'cancelado' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => alterarStatus(agendamento.id, 'cancelado')}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <XCircle className="h-3 w-3 mr-1" />
                                                Cancelar
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Agendamentos;

