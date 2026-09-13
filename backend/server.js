require('dotenv').config();

const app = require('./src/config/app');
const { ensureSeed } = require('./src/data/seed');

const PORT = process.env.PORT || 8000;

async function start() {
  await ensureSeed();

  app.listen(PORT, () => {
    console.log(`Node backend escuchando en http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error('Error al iniciar backend:', error);
  process.exit(1);
});
