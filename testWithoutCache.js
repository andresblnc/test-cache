const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'test_db'
  });

  try {
    // Limpiar tabla si existe
    await connection.execute('DROP TABLE IF EXISTS users');
    
    // Crear tabla nueva
    await connection.execute(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insertar 1000 usuarios (nuevo lote cada ejecución)
    for (let i = 0; i < 1000; i++) {
      await connection.execute(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        [`User ${i}`, `user${i}@test.com`]
      );
    }

    // Consultas de prueba
    console.time('Consulta sin cache');
    for (let i = 0; i < 1000; i++) {
      const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [Math.floor(Math.random() * 100) + 1]);
    }
    console.timeEnd('Consulta sin cache');

  } finally {
    await connection.end();
  }
}

main().catch(console.error);