const express = require('express');
const app = express();
app.use(express.json());

let treinos = [];
let idCounter = 1;

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
    // e atribui o resultado a 'nomeExercicioLower'
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
    // e atribui o resultado a 'nomeExercicioLower'
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

app.listen(3000, () => console.log('API rodando em http://localhost:3000'));
