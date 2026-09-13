const app = require('./src/config/app');

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Node backend escuchando en http://localhost:${PORT}`);
});
