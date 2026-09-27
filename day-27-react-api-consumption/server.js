import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Mock Database State for Day 27 Standalone Demo
let products = [
  { id: 'prd_1', title: 'Wireless Noise Cancelling Headphones', category: 'Electronics', price: 299.99, stock: 45, description: 'Premium sound with active noise control.', createdAt: '2026-09-20' },
  { id: 'prd_2', title: 'React & TypeScript Masterclass', category: 'Books', price: 49.50, stock: 120, description: 'Comprehensive guide to modern web development.', createdAt: '2026-09-21' },
  { id: 'prd_3', title: 'Ergonomic Mesh Office Chair', category: 'Furniture', price: 249.00, stock: 18, description: 'High back lumbar support office chair.', createdAt: '2026-09-22' },
  { id: 'prd_4', title: 'Mechanical Keyboard RGB Blue Switch', category: 'Electronics', price: 89.99, stock: 60, description: 'Tactile mechanical switches with customizable lighting.', createdAt: '2026-09-23' },
  { id: 'prd_5', title: '4K IPS USB-C Monitor 27"', category: 'Electronics', price: 450.00, stock: 12, description: 'Color accurate monitor for designers and devs.', createdAt: '2026-09-24' }
];

// GET Products with search, filter, pagination
app.get('/api/v1/products', (req, res) => {
  const { search, category, page = 1, limit = 10 } = req.query;
  let filtered = [...products];

  if (category && category !== 'All') {
    filtered = filtered.filter(p => p.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / limitNum) || 1;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(startIndex, startIndex + limitNum);

  res.json({
    success: true,
    data: paginated,
    pagination: { page: pageNum, limit: limitNum, totalItems, totalPages }
  });
});

// POST Product
app.post('/api/v1/products', (req, res) => {
  const { title, category, price, stock, description } = req.body;
  if (!title || title.trim().length < 3) {
    return res.status(400).json({ success: false, error: { message: 'Title must be at least 3 chars' } });
  }
  const newProduct = {
    id: `prd_${Date.now()}`,
    title,
    category: category || 'Electronics',
    price: Number(price),
    stock: Number(stock || 0),
    description: description || '',
    createdAt: new Date().toISOString().split('T')[0]
  };
  products.unshift(newProduct);
  res.status(201).json({ success: true, data: newProduct });
});

// PUT Product
app.put('/api/v1/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, error: { message: 'Product not found' } });

  products[index] = { ...products[index], ...req.body, price: Number(req.body.price), stock: Number(req.body.stock) };
  res.json({ success: true, data: products[index] });
});

// DELETE Product
app.delete('/api/v1/products/:id', (req, res) => {
  products = products.filter(p => p.id !== req.params.id);
  res.json({ success: true, message: 'Deleted successfully' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🌐 React API Consumption App running at http://localhost:${PORT}`);
});
