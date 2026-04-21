const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminExiste = await User.findOne({ email: 'admin@stockpro.com' });
    if (adminExiste) return;

    // Hash pre-generado de "Admin2024!"
    await User.create({
      nombre: 'Administrador',
      email: 'admin@stockpro.com',
      password: '$2b$12$JtHB1z7Vet0ght8ZFi0Ib.MpDhP/eR14T3YVUJisCt7j28oD4hxqK',
      rol: 'admin',
      activo: true,
    });

    console.log('✅ Admin creado: admin@stockpro.com / Admin2024!');
  } catch (error) {
    console.error('Error al crear admin:', error.message);
  }
};

module.exports = seedAdmin;
