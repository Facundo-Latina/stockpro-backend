const User = require('../models/User');

module.exports = async function seedAdmin() {
  try {
    const exists = await User.findOne({ email: 'admin@stockpro.com' });
    if (exists) return;
    await User.create({
      nombre: 'Administrador',
      email: 'admin@stockpro.com',
      password: '$2b$12$JtHB1z7Vet0ght8ZFi0Ib.MpDhP/eR14T3YVUJisCt7j28oD4hxqK',
      rol: 'admin',
      activo: true,
    });
    console.log('Admin created: admin@stockpro.com / Admin2024!');
  } catch (err) {
    console.error('Seeder error:', err.message);
  }
};
