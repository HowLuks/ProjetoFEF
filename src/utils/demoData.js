// Dados fictícios para testes

export function loadDemoData() {
    // Verifica se os dados já existem no localStorage para evitar sobrescrever
    if (localStorage.getItem("clientes") === null) {
        const clientes = [
            { id: 1, nome: "João Silva", cpf: "111.111.111-11", email: "joao.silva@example.com", telefone: "(11) 98765-4321", dataNascimento: "15/01/1990" },
            { id: 2, nome: "Maria Souza", cpf: "222.222.222-22", email: "maria.souza@example.com", telefone: "(21) 91234-5678", dataNascimento: "20/03/1985" },
            { id: 3, nome: "Pedro Santos", cpf: "333.333.333-33", email: "pedro.santos@example.com", telefone: "(31) 99876-1234", dataNascimento: "01/07/2010", responsavel: { nome: "Ana Santos", cpf: "999.999.999-99" } }, // Menor de idade
            { id: 4, nome: "Ana Oliveira", cpf: "444.444.444-44", email: "ana.oliveira@example.com", telefone: "(41) 97654-3210", dataNascimento: "25/11/1992" },
            { id: 5, nome: "Carlos Pereira", cpf: "555.555.555-55", email: "carlos.pereira@example.com", telefone: "(51) 96543-2109", dataNascimento: "10/09/1978" }
        ];
        localStorage.setItem("clientes", JSON.stringify(clientes));
    }

    if (localStorage.getItem("produtos") === null) {
        const produtos = [
            { id: 1, nome: "Camiseta", descricao: "Camiseta de algodão", quantidade: 50, precoUnitario: 29.90, codigo: "PROD001" },
            { id: 2, nome: "Calça Jeans", descricao: "Calça jeans slim fit", quantidade: 30, precoUnitario: 89.90, codigo: "PROD002" },
            { id: 3, nome: "Tênis Esportivo", descricao: "Tênis para corrida", quantidade: 20, precoUnitario: 149.90, codigo: "PROD003" },
            { id: 4, nome: "Meia", descricao: "Meia de algodão", quantidade: 100, precoUnitario: 9.90, codigo: "PROD004" },
            { id: 5, nome: "Boné", descricao: "Boné esportivo", quantidade: 40, precoUnitario: 39.90, codigo: "PROD005" },
            { id: 6, nome: "Jaqueta", descricao: "Jaqueta corta-vento", quantidade: 15, precoUnitario: 199.90, codigo: "PROD006" },
            { id: 7, nome: "Mochila", descricao: "Mochila escolar", quantidade: 25, precoUnitario: 79.90, codigo: "PROD007" },
            { id: 8, nome: "Óculos de Sol", descricao: "Óculos de sol polarizado", quantidade: 35, precoUnitario: 59.90, codigo: "PROD008" },
            { id: 9, nome: "Relógio", descricao: "Relógio digital", quantidade: 10, precoUnitario: 129.90, codigo: "PROD009" },
            { id: 10, nome: "Cinto", descricao: "Cinto de couro", quantidade: 60, precoUnitario: 49.90, codigo: "PROD010" }
        ];
        localStorage.setItem("produtos", JSON.stringify(produtos));
    }

    if (localStorage.getItem("vendas") === null) {
        const vendas = [
            { id: 1, data: "10/08/2025", produtos: [{ id: 1, quantidade: 2 }], total: 59.80, metodoPagamento: "PIX", vendedorId: 1, clienteId: 2 },
            { id: 2, data: "11/08/2025", produtos: [{ id: 2, quantidade: 1 }, { id: 4, quantidade: 5 }], total: 139.40, metodoPagamento: "Cartão", vendedorId: 2 , clienteId: 1},
            { id: 3, data: "12/08/2025", produtos: [{ id: 3, quantidade: 1 }], total: 149.90, metodoPagamento: "Espécie", vendedorId: 1, clienteId: 3}
        ];
        localStorage.setItem("vendas", JSON.stringify(vendas));
    }

    // Garante que as credenciais padrão de admin e vendedor existam se não houver nenhum vendedor
    if (localStorage.getItem("vendedores") === null || JSON.parse(localStorage.getItem("vendedores")).length === 0) {
        const vendedores = [
            { id: 1, username: "vendedor1", password: "123", role: "vendedor" },
            { id: 2, username: "vendedor2", password: "123", role: "vendedor" },
            { id: 3, username: "admin", password: "admin", role: "admin" }
        ];
        localStorage.setItem("vendedores", JSON.stringify(vendedores));
    }

    if (localStorage.getItem("fluxoCaixa") === null) {
        const fluxoCaixa = [
            { id: 1, tipo: "entrada", descricao: "Venda #1", valor: 59.80, data: "10/08/2025" },
            { id: 2, tipo: "saida", descricao: "Aluguel", valor: 1500.00, data: "05/08/2025" },
            { id: 3, tipo: "entrada", descricao: "Venda #2", valor: 139.40, data: "11/08/2025" },
            { id: 4, tipo: "entrada", descricao: "Venda #3", valor: 149.90, data: "12/08/2025" }
        ];
        localStorage.setItem("fluxoCaixa", JSON.stringify(fluxoCaixa));
    }
}
