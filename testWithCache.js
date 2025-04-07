const mysql = require('mysql2/promise');
const Redis = require('ioredis');

async function main() {
  const mysqlConnection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'test_db'
  });

  const redis = new Redis({
    host: 'localhost',
    port: 6379
  });

  try {
    // Realizar consultas de prueba con cache
    console.time('Consulta con cache');
    for (let i = 0; i < 1000; i++) {
      const randomId = Math.floor(Math.random() * 100) + 1;
      const cacheKey = `user:${randomId}`;
      
      // Intentar obtener del cache
      const cachedUser = await redis.get(cacheKey);
      
      if (!cachedUser) {
        // Si no está en cache, consultar la base de datos
        const [rows] = await mysqlConnection.execute('SELECT * FROM users WHERE id = ?', [randomId]);
        // Almacenar en cache con expiración de 30 segundos
        await redis.set(cacheKey, JSON.stringify(rows[0]), 'EX', 30);
      }
    }
    console.timeEnd('Consulta con cache');

  } finally {
    await mysqlConnection.end();
    await redis.quit();
  }
}

main().catch(console.error);