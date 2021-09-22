const express = require('express');
const cors = require('cors');

const { v4: uuid } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;

  const user = users.find((user) => user.username === username);

  if(!user) {
    return res.status(404).json({ error: "User not found!" });
  }
  req.user = user;
  return next();
}

app.post('/users', (req, res) => {
  const { name, username } = req.body;

  const userAlreadyExist = users.some((user) => user.username === username);

  if(userAlreadyExist) {
    return res.status(400).json({ error: 'Username already exist!' });
  }

  const user = {
    id: uuid(),
    name,
    username,
    todos: []
  }
  users.push(user);

  return res.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req;

  return res.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { title, deadline } = req.body;

  const makeToDo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(makeToDo);

  return res.status(201).send(makeToDo);
});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { id } = req.params;
  const { title, deadline } = req.body;

  const toDo = user.todos.find((todo) => todo.id === id);

  if(!toDo) {
    return res.status(404).json({ error: 'ToDo is not found' });
  }

  toDo.title = title;
  toDo.deadline = deadline;

  return res.status(200).send(toDo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const toDo = user.todos.find((todo) => todo.id === id);

  if(!toDo) {
    return res.status(404).json({ error: 'ToDo is not found' });
  }
  
  toDo.done = true;

  return res.json(toDo);
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const toDo = user.todos.findIndex((todo) => todo.id === id);
  
  if(toDo === -1) {
    return res.status(404).json({ error: 'ToDo not found' });
  }

  user.todos.splice(toDo, 1);

  return res.status(204).send()
});

module.exports = app;