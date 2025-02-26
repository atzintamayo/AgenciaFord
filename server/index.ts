import express from 'express' 
import db from "./Database/db"
import cors from 'cors'
import bodyParser from 'body-parser';
const app = express()
const port = 3000
app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:5173', // puerto del front
  methods: ['GET', 'POST'], //metodos usados
  allowedHeaders: ['Content-Type'], 
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.get('/api', cors(corsOptions),async (req, res) => {
  try {
    const autos = await db.any(`
      SELECT 
        a.vin,
        m.nombre AS marca,
        a.submarca,
        a.modelo,
        c.nombre AS combustible,
        t.nombre AS transmision,
        ta.nombre AS tipo_auto,
        a.fecha_entrada,
        a.fecha_salida,
        u.nombre AS ubicacion,
        a.num_placa
        FROM auto a
        JOIN cat_marca m ON a.fk_marca = id_marca
        JOIN cat_combustible c ON a.fk_combustible = id_combustible
        JOIN cat_transmision t ON a.fk_transmision = id_transmision
        JOIN cat_tipoauto ta ON a.fk_tipoauto = id_tipoauto
        LEFT JOIN cat_tipoubicacion u ON a.fk_ubicacion = id_tipoubicacion;
    `);
    res.json(autos);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error al obtener los autos');
  }

})
app.post('/autos', async (req, res) => {
  const { vin, marca, modelo, tipoAuto, numPlaca } = req.body;

  try {
    const result = await db.query(
      'INSERT INTO auto (vin, fk_marca, modelo, fk_tipoauto, num_placa) VALUES ($1, $2, $3, $4, $5)',
      [vin, marca, modelo, tipoAuto, numPlaca]
    );
    res.json({ success: true, message: 'Auto agregado exitosamente' });
  } catch (error) {
    console.error('Error al agregar auto:', error);
    res.json({ success: false, message: 'Error al agregar auto' });
  }
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

