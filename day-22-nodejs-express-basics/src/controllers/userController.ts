import { Request, Response } from 'express';
import { User } from '../types';

let users: User[] = [
  { id: 1, name: 'Sinh Huân', email: 'sinh.huan@example.com', role: 'admin' },
  { id: 2, name: 'Thanh Mai', email: 'thanh.mai@example.com', role: 'developer' },
  { id: 3, name: 'Minh Tuấn', email: 'minh.tuan@example.com', role: 'guest' }
];
let nextUserId = 4;

export const getAllUsers = (req: Request, res: Response): void => {
  res.json({
    total: users.length,
    data: users
  });
};

export const getUserById = (req: Request, res: Response): void => {
  const userId = Number(req.params.id);

  if (isNaN(userId)) {
    res.status(400).json({ error: 'User ID must be a number' });
    return;
  }

  const user = users.find(u => u.id === userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ data: user });
};

export const createUser = (req: Request, res: Response): void => {
  const { name, email, role } = req.body;

  if (!name || !email) {
    res.status(400).json({ error: 'Name and email are required' });
    return;
  }

  const newUser: User = {
    id: nextUserId++,
    name: String(name).trim(),
    email: String(email).trim(),
    role: role ? String(role).trim() : 'member'
  };

  users.push(newUser);
  res.status(201).json({
    message: 'User created successfully',
    data: newUser
  });
};

export const updateUser = (req: Request, res: Response): void => {
  const userId = Number(req.params.id);
  const user = users.find(u => u.id === userId);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const { name, email, role } = req.body;
  if (name) user.name = String(name).trim();
  if (email) user.email = String(email).trim();
  if (role) user.role = String(role).trim();

  res.json({
    message: 'User updated successfully',
    data: user
  });
};

export const deleteUser = (req: Request, res: Response): void => {
  const userId = Number(req.params.id);
  const index = users.findIndex(u => u.id === userId);

  if (index === -1) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  users.splice(index, 1);
  res.status(204).send();
};
