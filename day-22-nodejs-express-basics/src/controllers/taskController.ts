import { Request, Response, NextFunction } from 'express';
import { Task } from '../types';

// In-memory data store cho Tasks (theo Câu 5 trong bài học ngày 22)
let tasks: Task[] = [
  { id: 1, title: 'Học Node.js Event Loop & Non-blocking I/O', done: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, title: 'Tìm hiểu Express Routing & Middleware Chain', done: true, createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 3, title: 'Tạo REST API Task Manager với TypeScript', done: false, createdAt: new Date().toISOString() }
];
let nextId = 4;

/**
 * GET /api/tasks
 * Lấy danh sách tasks, hỗ trợ query params:
 * - ?done=true / ?done=false (lọc theo trạng thái)
 * - ?search=keyword (tìm kiếm theo tiêu đề)
 */
export const getAllTasks = (req: Request, res: Response): void => {
  const { done, search } = req.query;
  let result = [...tasks];

  // Lọc theo query param 'done' (chuyển string từ req.query sang boolean)
  if (done !== undefined) {
    const isDone = done === 'true';
    result = result.filter(t => t.done === isDone);
  }

  // Lọc theo query param 'search'
  if (typeof search === 'string' && search.trim() !== '') {
    const keyword = search.toLowerCase();
    result = result.filter(t => t.title.toLowerCase().includes(keyword));
  }

  res.json({
    total: result.length,
    data: result
  });
};

/**
 * GET /api/tasks/:id
 * Lấy chi tiết 1 task theo URL param (:id)
 */
export const getTaskById = (req: Request, res: Response): void => {
  const taskId = Number(req.params.id);

  if (isNaN(taskId)) {
    res.status(400).json({ error: 'Invalid Task ID. ID must be a number' });
    return;
  }

  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    res.status(404).json({ error: `Task with id ${taskId} not found` });
    return;
  }

  res.json({ data: task });
};

/**
 * POST /api/tasks
 * Tạo task mới từ JSON req.body
 */
export const createTask = (req: Request, res: Response): void => {
  const { title } = req.body;

  // Validation
  if (!title || typeof title !== 'string' || title.trim() === '') {
    res.status(400).json({ error: 'Field "title" is required and must be a non-empty string' });
    return;
  }

  const newTask: Task = {
    id: nextId++,
    title: title.trim(),
    done: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  res.status(201).json({
    message: 'Task created successfully',
    data: newTask
  });
};

/**
 * PUT /api/tasks/:id
 * Cập nhật task (title, done)
 */
export const updateTask = (req: Request, res: Response): void => {
  const taskId = Number(req.params.id);

  if (isNaN(taskId)) {
    res.status(400).json({ error: 'Invalid Task ID. ID must be a number' });
    return;
  }

  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    res.status(404).json({ error: `Task with id ${taskId} not found` });
    return;
  }

  const { title, done } = req.body;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      res.status(400).json({ error: '"title" must be a non-empty string' });
      return;
    }
    task.title = title.trim();
  }

  if (done !== undefined) {
    if (typeof done !== 'boolean') {
      res.status(400).json({ error: '"done" must be a boolean' });
      return;
    }
    task.done = done;
  }

  res.json({
    message: 'Task updated successfully',
    data: task
  });
};

/**
 * DELETE /api/tasks/:id
 * Xóa 1 task theo ID
 */
export const deleteTask = (req: Request, res: Response): void => {
  const taskId = Number(req.params.id);

  if (isNaN(taskId)) {
    res.status(400).json({ error: 'Invalid Task ID. ID must be a number' });
    return;
  }

  const index = tasks.findIndex(t => t.id === taskId);
  if (index === -1) {
    res.status(404).json({ error: `Task with id ${taskId} not found` });
    return;
  }

  tasks.splice(index, 1);
  // HTTP 204: No Content - thao tác thành công và không cần trả về body
  res.status(204).send();
};
