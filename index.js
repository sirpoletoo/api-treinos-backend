const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());

let treinos = []; // Array para treinos base
let idCounter = 1; // Contador para treinos base

// NOVAS VARIÁVEIS PARA TREINOS REALIZADOS
let treinosRealizados = [];
let idTreinoRealizadoCounter = 1;


// Criar treino
app.post('/treinos', (req, res) => {
  const { nome, exercicios } = req.body;

  // PASSO NOVO: Verificar se já existe um treino com o mesmo nome
  const nomeExistente = treinos.find(treino => treino.nome === nome);

  if (nomeExistente) {
    // Se o nome já existe, retorna um erro 409 Conflict
    return res.status(409).json({ erro: 'Já existe um treino com este nome.' });
  }

  // NOVO PASSO: Verificar se há exercícios com nomes duplicados dentro do mesmo treino
  const exerciciosSet = new Set();
  // Percorre cada string de exercício no array 'exercicios'
  for (const exercicio of exercicios) {
    // CORREÇÃO AQUI: Chama toLowerCase() diretamente na string 'exercicio'
    // e ATRIBUI o resultado a 'nomeExercicioLower'
    const nomeExercicioLower = exercicio.toLowerCase(); 
    if (exerciciosSet.has(nomeExercicioLower)) {
      // Se um exercício com o mesmo nome (case-insensitive) já foi adicionado ao Set
      return res.status(400).json({ erro: `Exercício duplicado encontrado no treino: '${exercicio}'.` });
    }
    exerciciosSet.add(nomeExercicioLower);
  }

  // Se o nome do treino é único e não há exercícios duplicados, procede com a criação
  const treino = { id: idCounter++, nome, exercicios };
  treinos.push(treino);
  res.status(201).json(treino);
});

// Listar todos os treinos
app.get('/treinos', (req, res) => {
  res.json(treinos);
});

// Buscar treino por ID
app.get('/treinos/:id', (req, res) => {
  const treino = treinos.find(t => t.id === parseInt(req.params.id));
  if (!treino) return res.status(404).json({ erro: 'Treino não encontrado' });
  res.json(treino);
});

// Atualizar treino
app.put('/treinos/:id', (req, res) => {
  const treino = treinos.find(t => t.id === parseInt(req.params.id));
  if (!treino) return res.status(404).json({ erro: 'Treino não encontrado' });

  const { nome, exercicios } = req.body;

  // PASSO NOVO: Verificar se o novo nome do treino já existe em OUTRO treino
  const nomeDuplicado = treinos.find(t => t.nome === nome && t.id !== treino.id);
  if (nomeDuplicado) {
    return res.status(409).json({ erro: 'Já existe outro treino com este nome.' });
  }

  // NOVO PASSO: Verificar se há exercícios com nomes duplicados dentro do treino que está sendo atualizado
  const exerciciosSet = new Set();
  // Percorre cada string de exercício no array 'exercicios'
  for (const exercicio of exercicios) {
    // CORREÇÃO AQUI: Chama toLowerCase() diretamente na string 'exercicio'
    // e ATRIBUI o resultado a 'nomeExercicioLower'
    const nomeExercicioLower = exercicio.toLowerCase();
    if (exerciciosSet.has(nomeExercicioLower)) {
      return res.status(400).json({ erro: `Exercício duplicado encontrado no treino: '${exercicio}'.` });
    }
    exerciciosSet.add(nomeExercicioLower);
  }

  treino.nome = nome;
  treino.exercicios = exercicios;
  res.json(treino);
});

// Remover treino
app.delete('/treinos/:id', (req, res) => {
  const index = treinos.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ erro: 'Treino não encontrado' });

  treinos.splice(index, 1);
  res.status(204).send();
});


// NOVO ENDPOINT: Registrar um Treino Realizado
app.post('/treinos-realizados', (req, res) => {
  // 1. Extrair Dados da Requisição
  const { nomeDoTreino, exerciciosRealizados } = req.body;

  // 2. Validar se 'nomeDoTreino' e 'exerciciosRealizados' foram fornecidos
  if (!nomeDoTreino || !exerciciosRealizados || !Array.isArray(exerciciosRealizados) || exerciciosRealizados.length === 0) {
    return res.status(400).json({ erro: 'Nome do treino e lista de exercícios realizados são obrigatórios.' });
  }

  // 3. Validar Duplicatas no array 'exerciciosRealizados' recebido
  const exerciciosRealizadosSet = new Set();
  for (const exercicioRealizado of exerciciosRealizados) {
    // Verifica se o item é uma string antes de chamar toLowerCase
    if (typeof exercicioRealizado !== 'string') {
        return res.status(400).json({ erro: `Exercício inválido na lista de realizados: '${exercicioRealizado}'. Esperado uma string.` });
    }
    const nomeExercicioRealizadoLower = exercicioRealizado.toLowerCase();
    if (exerciciosRealizadosSet.has(nomeExercicioRealizadoLower)) {
      return res.status(400).json({ erro: `Exercício duplicado encontrado na lista de exercícios realizados: '${exercicioRealizado}'.` });
    }
    exerciciosRealizadosSet.add(nomeExercicioRealizadoLower);
  }

  // 4. Regra de Negócio 1: "O treino realizado cadastrado deve estar cadastrado na lista de treinos."
  // Procura o treino base pelo nome (comparando de forma case-insensitive)
  const treinoBaseEncontrado = treinos.find(treino => treino.nome.toLowerCase() === nomeDoTreino.toLowerCase());

  if (!treinoBaseEncontrado) { // Se o treino base NÃO for encontrado
    return res.status(404).json({ erro: `Treino base '${nomeDoTreino}' não encontrado.` });
  }

  // 5. Regra de Negócio 2: "O exercício informado deve estar cadastrado no treino específico."
  // Percorre os exercícios que foram 'realizados' e verifica se cada um existe no treino base
  for (const exercicioRealizado of exerciciosRealizados) {
    const nomeExercicioRealizadoLower = exercicioRealizado.toLowerCase();
    // Procura o exercício na lista de exercícios do treino base (também case-insensitive)
    const exercicioValidoNoTreinoBase = treinoBaseEncontrado.exercicios.find(
      exDoTreinoBase => exDoTreinoBase.toLowerCase() === nomeExercicioRealizadoLower
    );

    if (!exercicioValidoNoTreinoBase) { // Se um exercício realizado NÃO estiver no treino base
      return res.status(400).json({ erro: `Exercício '${exercicioRealizado}' não pertence ao treino base '${treinoBaseEncontrado.nome}'.` });
    }
  }

  // 6. Se todas as validações e regras de negócio passarem, cria o novo registro
  const novoTreinoRealizado = {
    id: idTreinoRealizadoCounter++, 
    nomeDoTreino: nomeDoTreino,
    exerciciosRealizados: exerciciosRealizados,
    dataRealizacao: new Date().toISOString() 
  };

  treinosRealizados.push(novoTreinoRealizado); 

  
  res.status(201).json(novoTreinoRealizado); 
});


app.listen(3000, () => console.log('API rodando em http://localhost:3000'));
