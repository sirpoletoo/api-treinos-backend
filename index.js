const express = require('express');
const app = express();
app.use(express.json());

let treinos = [];
let idCounter = 1;

// Criar treino
app.post('/treinos', (req, res) => {
  const { nome, exercicios } = req.body;
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