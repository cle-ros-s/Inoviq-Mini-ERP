const prisma = require('../config/prisma');

const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Name is required' } });

    let finalCode = code;
    if (!finalCode) {
      const count = await prisma.category.count();
      finalCode = `CAT-${String(count + 1).padStart(3, '0')}`;
    }

    const category = await prisma.category.create({
      data: { code: finalCode, name }
    });
    res.status(201).json({ success: true, data: category, message: 'Category created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { name }
    });
    res.json({ success: true, data: category, message: 'Category updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const count = await prisma.product.count({ where: { categoryId: req.params.id } });
    if (count > 0) {
      return res.status(400).json({ success: false, error: { code: 'HAS_RELATIONS', message: 'Cannot delete category with linked products' } });
    }
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };
