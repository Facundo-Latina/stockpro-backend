const { body, param, validationResult } = require('express-validator');

// Función helper para manejar los errores de validación
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Error de validación',
      errors: errors.array().map(e => ({ campo: e.path, mensaje: e.msg }))
    });
  }
  next();
};

// Validaciones para auth
const validateRegister = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('El email no tiene un formato válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  handleValidation
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('El email no tiene un formato válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida'),
  handleValidation
];

// Validaciones para productos
const validateProduct = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre del producto es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('stock')
    .notEmpty().withMessage('El stock es requerido')
    .isInt({ min: 0 }).withMessage('El stock debe ser un número entero mayor o igual a 0'),
  body('precio')
    .optional()
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número mayor o igual a 0'),
  body('stockMinimo')
    .optional()
    .isInt({ min: 0 }).withMessage('El stock mínimo debe ser un número entero mayor o igual a 0'),
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('La descripción no puede superar los 500 caracteres'),
  handleValidation
];

const validateStockUpdate = [
  body('stock')
    .notEmpty().withMessage('La cantidad es requerida')
    .isFloat({ min: 0 }).withMessage('La cantidad debe ser mayor o igual a 0'),
  body('operacion')
    .notEmpty().withMessage('La operación es requerida')
    .isIn(['set', 'add', 'subtract']).withMessage('La operación debe ser set, add o subtract'),
  handleValidation
];

// Validaciones para categorías
const validateCategory = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre de la categoría es requerido')
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('La descripción no puede superar los 200 caracteres'),
  handleValidation
];

// Validaciones para usuarios
const validateUpdateUser = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('El email no tiene un formato válido')
    .normalizeEmail(),
  body('rol')
    .optional()
    .isIn(['admin', 'usuario']).withMessage('El rol debe ser admin o usuario'),
  handleValidation
];

// Validar que el ID de MongoDB sea válido
const validateMongoId = [
  param('id').isMongoId().withMessage('El ID no es válido'),
  handleValidation
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProduct,
  validateStockUpdate,
  validateCategory,
  validateUpdateUser,
  validateMongoId
};
