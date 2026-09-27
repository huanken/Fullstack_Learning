/**
 * In-Memory Async Database Storage Engine (Simulates DB connection & operations)
 */

export const dbState = {
  products: [
    {
      id: 'prd_101',
      title: 'Ergonomic Wireless Mouse',
      category: 'Electronics',
      price: 49.99,
      stock: 120,
      description: 'Precision ergonomic wireless mouse with silent clicks.',
      isDeleted: false,
      createdAt: new Date('2026-09-01T08:00:00Z').toISOString(),
      updatedAt: new Date('2026-09-01T08:00:00Z').toISOString()
    },
    {
      id: 'prd_102',
      title: 'Mechanical RGB Keyboard',
      category: 'Electronics',
      price: 129.99,
      stock: 45,
      description: 'Custom hot-swappable mechanical keyboard with RGB backlighting.',
      isDeleted: false,
      createdAt: new Date('2026-09-05T10:30:00Z').toISOString(),
      updatedAt: new Date('2026-09-05T10:30:00Z').toISOString()
    },
    {
      id: 'prd_103',
      title: 'Clean Architecture in Node.js',
      category: 'Books',
      price: 39.50,
      stock: 80,
      description: 'Master backend architecture, design patterns, and scalability.',
      isDeleted: false,
      createdAt: new Date('2026-09-10T14:15:00Z').toISOString(),
      updatedAt: new Date('2026-09-10T14:15:00Z').toISOString()
    },
    {
      id: 'prd_104',
      title: 'Ultra-wide 34-inch Curved Monitor',
      category: 'Electronics',
      price: 599.00,
      stock: 15,
      description: '144Hz 1ms curved gaming & productivity monitor.',
      isDeleted: false,
      createdAt: new Date('2026-09-12T09:00:00Z').toISOString(),
      updatedAt: new Date('2026-09-12T09:00:00Z').toISOString()
    },
    {
      id: 'prd_105',
      title: 'Standing Desk Dual-Motor',
      category: 'Furniture',
      price: 349.00,
      stock: 25,
      description: 'Electric height adjustable desk with memory presets.',
      isDeleted: false,
      createdAt: new Date('2026-09-15T16:45:00Z').toISOString(),
      updatedAt: new Date('2026-09-15T16:45:00Z').toISOString()
    }
  ]
};

// Simulate async database I/O latency
export const delay = (ms = 20) => new Promise(resolve => setTimeout(resolve, ms));
