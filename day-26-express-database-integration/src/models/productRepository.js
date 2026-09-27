import { dbState, delay } from '../config/database.js';

export const productRepository = {
  async findAll({ page = 1, limit = 10, category, search, sortBy = 'createdAt', order = 'desc' }) {
    await delay();
    let result = dbState.products.filter(p => !p.isDeleted);

    // Filter by category
    if (category) {
      result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // Search keyword in title or description
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    // Sorting
    result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const totalItems = result.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = result.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalItems,
        totalPages
      }
    };
  },

  async findById(id) {
    await delay();
    return dbState.products.find(p => p.id === id && !p.isDeleted) || null;
  },

  async create(data) {
    await delay();
    const newId = `prd_${Date.now()}`;
    const now = new Date().toISOString();
    const newProduct = {
      id: newId,
      title: data.title,
      category: data.category,
      price: Number(data.price),
      stock: Number(data.stock || 0),
      description: data.description || '',
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };
    dbState.products.unshift(newProduct);
    return newProduct;
  },

  async update(id, data) {
    await delay();
    const index = dbState.products.findIndex(p => p.id === id && !p.isDeleted);
    if (index === -1) return null;

    const existing = dbState.products[index];
    const updated = {
      ...existing,
      ...data,
      price: data.price !== undefined ? Number(data.price) : existing.price,
      stock: data.stock !== undefined ? Number(data.stock) : existing.stock,
      updatedAt: new Date().toISOString()
    };

    dbState.products[index] = updated;
    return updated;
  },

  async softDelete(id) {
    await delay();
    const product = await this.findById(id);
    if (!product) return false;
    product.isDeleted = true;
    product.updatedAt = new Date().toISOString();
    return true;
  }
};
