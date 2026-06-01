const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');
const { validateProduct, validateStockUpdate, validateMongoId } = require('../middleware/validate');

// GET /api/products/stats - dashboard metrics (admin)
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [total, sinStock, bajosDeStock, porCategoria] = await Promise.all([
      Product.countDocuments({ activo: true }),
      Product.countDocuments({ activo: true, stock: 0 }),
      Product.countDocuments({ activo: true, $expr: { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', '$stockMinimo'] }] } }),
      Product.aggregate([
        { $match: { activo: true } },
        { $group: { _id: '$categoria', count: { $sum: 1 }, stockTotal: { $sum: '$stock' } } },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
        { $project: { nombre: { $ifNull: [{ $arrayElemAt: ['$cat.nombre', 0] }, 'Sin categoría'] }, count: 1, stockTotal: 1 } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
    ]);
    res.json({ total, sinStock, bajosDeStock, enStock: total - sinStock - bajosDeStock, porCategoria });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas.', error: error.message });
  }
});

// GET /api/products
router.get('/', protect, async (req, res) => {
  try {
    const { categoria, busqueda, soloActivos, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (soloActivos !== 'false') filter.activo = true;
    if (categoria) filter.categoria = categoria;
    if (busqueda) filter.nombre = { $regex: busqueda, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).populate('categoria', 'nombre').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos.', error: error.message });
  }
});

// GET /api/products/:id
router.get('/:id', protect, validateMongoId, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoria', 'nombre');
    if (!product) return res.status(404).json({ message: 'Producto no encontrado.' });
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener producto.', error: error.message });
  }
});

// POST /api/products
router.post('/', protect, adminOnly, validateProduct, async (req, res) => {
  try {
    const { nombre, descripcion, stock, precio, categoria, stockMinimo } = req.body;
    const product = await Product.create({
      nombre, descripcion, stock, precio,
      categoria: categoria || null,
      stockMinimo: stockMinimo || 5,
      fechaUltimoControlStock: new Date(),
    });
    const populated = await product.populate('categoria', 'nombre');
    res.status(201).json({ message: 'Producto creado.', product: populated });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear producto.', error: error.message });
  }
});

// PUT /api/products/:id
router.put('/:id', protect, adminOnly, validateMongoId, validateProduct, async (req, res) => {
  try {
    const { nombre, descripcion, stock, precio, categoria, stockMinimo } = req.body;
    const data = { nombre, descripcion, stock, precio, stockMinimo };
    if (categoria !== undefined) data.categoria = categoria || null;
    if (stock !== undefined) data.fechaUltimoControlStock = new Date();
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true }).populate('categoria', 'nombre');
    if (!product) return res.status(404).json({ message: 'Producto no encontrado.' });
    res.json({ message: 'Producto actualizado.', product });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar producto.', error: error.message });
  }
});

// PATCH /api/products/:id/stock
router.patch('/:id/stock', protect, validateMongoId, validateStockUpdate, async (req, res) => {
  try {
    const { stock, operacion } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado.' });

    let nuevo = product.stock;
    if (operacion === 'add') nuevo += Number(stock);
    else if (operacion === 'subtract') nuevo -= Number(stock);
    else nuevo = Number(stock);

    if (nuevo < 0) return res.status(400).json({ message: 'El stock no puede quedar negativo.' });

    product.stock = nuevo;
    product.fechaUltimoControlStock = new Date();
    await product.save();
    const populated = await product.populate('categoria', 'nombre');
    res.json({ message: 'Stock actualizado.', product: populated });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar stock.', error: error.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', protect, adminOnly, validateMongoId, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
    if (!product) return res.status(404).json({ message: 'Producto no encontrado.' });
    res.json({ message: 'Producto eliminado.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar producto.', error: error.message });
  }
});

module.exports = router;
