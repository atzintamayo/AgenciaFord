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

app.get('/api/vehiculos', async (req, res) => {
  try {
      const vehiculos = await db.any(`
          SELECT 
              cat_marca.nombre AS marca,
              vehiculo.submarca,
              vehiculo.modelo, 
              cat_combustible.nombre AS combustible,
              cat_transmision.nombre AS transmision, 
              vehiculo.numpuertas,
              vehiculo.numejes, 
              cat_tipovehiculo.nombre AS tipovehiculo,
              estacionamiento.estacionamiento, 
              edificio.nombre AS ubicacion,
              vehiculo.num_placa,
              vehiculo.color,
              vehiculo.kilometraje
              vehiculo.vin
          FROM vehiculo
          JOIN cat_marca ON vehiculo.fk_marca = cat_marca.id_marca
          JOIN cat_combustible ON vehiculo.fk_combustible = cat_combustible.id_combustible
          JOIN cat_transmision ON vehiculo.fk_transmision = cat_transmision.id_transmision
          JOIN cat_tipovehiculo ON vehiculo.fk_tipovehiculo = cat_tipovehiculo.id_tipovehiculo
          JOIN estacionamiento ON vehiculo.fk_estacionamiento = estacionamiento.id_estacionamiento
          JOIN edificio ON estacionamiento.fk_edificio = edificio.id_edificio
      `);/* OBTIENE:
            string marca, 
            string submarca, 
            string modelo, 
            string combustible, 
            string transmision, 
            int numpuertas, 
            int num_ejes, 
            string tipovehiculo, 
            string estacionamiento, 
            string ubicacion, 
            string num_placa
            string color
            int kilometraje
            string vin
         */ 

    res.json(vehiculos);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('hubo un error... ' + err.message);
  }
});

app.post('/api/vehiculos/insert', async (req, res) => {
  try {
      const {
          vin, //string (17)
          marca, //string nombre de la marca
          submarca, //string
          modelo,  //string año
          combustible, //string nombre del combustible
          transmision, //string nombre de la transmision
          numpuertas, //int
          numejes, //int
          tipovehiculo, //string nombre del tipo de vehiculo
          estacionamiento, //int numero del estacionamiento
          ubicacion, //string nombre del edificio
          num_placa, //string (7)
      } = req.body;

      // Obtener los IDs de las tablas relacionadas
      const idMarca = await db.one('SELECT id_marca FROM cat_marca WHERE nombre = $1', [marca]);
      const idCombustible = await db.one('SELECT id_combustible FROM cat_combustible WHERE nombre = $1', [combustible]);
      const idTransmision = await db.one('SELECT id_transmision FROM cat_transmision WHERE nombre = $1', [transmision]);
      const idTipoVehiculo = await db.one('SELECT id_tipovehiculo FROM cat_tipovehiculo WHERE nombre = $1', [tipovehiculo]);
      const idEdificio = await db.one('SELECT id_edificio FROM edificio WHERE nombre = $1', [ubicacion]);
      const idEstacionamiento = await db.one('SELECT id_estacionamiento FROM estacionamiento WHERE estacionamiento = $1 AND fk_edificio = $2', [estacionamiento, idEdificio.id_edificio]);

      // Insertar el vehículo
      await db.none(
          `INSERT INTO vehiculo (fk_marca, submarca, modelo, fk_combustible, fk_transmision, numpuertas, numejes, fk_tipovehiculo, fk_estacionamiento, num_placa, vin)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
              idMarca.id_marca,
              submarca,
              modelo,
              idCombustible.id_combustible,
              idTransmision.id_transmision,
              numpuertas,
              numejes,
              idTipoVehiculo.id_tipovehiculo,
              idEstacionamiento.id_estacionamiento,
              num_placa,
              vin
          ]
      );

      res.status(201).json({ message: 'Vehículo insertado correctamente' });
  } catch (err) {
      res.status(500).json({ error: err.message });
      console.log('Hubo un error... ' + err.message);
  }
});

app.post('/api/importaciones/insert/', async (req, res) => {
    try {
        const {

            aduana_ing, //string
            fecha_in, //date
            num_in, //int
            vin, //string
            num_aduana, //string (2)
        } = req.body;
  
        // Insertar la importacion
        await db.none(
            `INSERT INTO importaciones (aduana_ing, fecha_in, num_in, fk_vin, num_aduana)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                aduana_ing,
                fecha_in,
                num_in,
                vin,
                num_aduana,
            ]
        );
  
        res.status(201).json({ message: 'importación insertada correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log('Hubo un error... ' + err.message);
    }
});

app.post('/api/seguro/insert/', async (req, res) => {
    try {
        const {

            poliza, //string
            aseguradora, //string nombre de la aseguradora
            vin, //string
            vencimiento, //date
            cobertura, //string nombre de la cobertura

        } = req.body;

        const idAseguradora = await db.one('SELECT id_aseguradora FROM aseguradora WHERE nombre = $1', [aseguradora]);
        const idCobertura = await db.one('SELECT id FROM cat_cobertura WHERE nombre = $1', [cobertura]);
        
        // Insertar la importacion
        await db.none(
            `INSERT INTO importaciones (aduana_ing, fecha_in, num_in, fk_vin, num_aduana)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                poliza,
                idAseguradora.id_aseguradora,
                vin,
                vencimiento,
                idCobertura.id,
            ]
        );
  
        res.status(201).json({ message: 'importación insertada correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log('Hubo un error... ' + err.message);
    }
});

app.put('/api/vehiculos/update/:id', async (req, res) => {
  try {
      const { vin } = req.params;
      const {
          marca, //string nombre de la marca
          submarca, //string
          modelo, //string año
          combustible, //string nombre del combustible
          transmision, //string nombre de la transmision
          numpuertas, //int
          numejes, //int
          tipovehiculo, //string nombre del tipo de vehiculo
          estacionamiento, //int numero del estacionamiento
          ubicacion, //string nombre del edificio
          num_placa, //string (7)
      } = req.body;

      // Obtener los IDs de las tablas relacionadas
      const idMarca = await db.one('SELECT id_marca FROM cat_marca WHERE nombre = $1', [marca]);
      const idCombustible = await db.one('SELECT id_combustible FROM cat_combustible WHERE nombre = $1', [combustible]);
      const idTransmision = await db.one('SELECT id_transmision FROM cat_transmision WHERE nombre = $1', [transmision]);
      const idTipoVehiculo = await db.one('SELECT id_tipovehiculo FROM cat_tipovehiculo WHERE nombre = $1', [tipovehiculo]);
      const idEdificio = await db.one('SELECT id_edificio FROM edificio WHERE nombre = $1', [ubicacion]);
      const idEstacionamiento = await db.one('SELECT id_estacionamiento FROM estacionamiento WHERE estacionamiento = $1 AND fk_edificio = $2', [estacionamiento, idEdificio.id_edificio]);

      // Actualizar el vehículo
      await db.none(
          `UPDATE vehiculo
           SET fk_marca = $1, submarca = $2, modelo = $3, fk_combustible = $4, fk_transmision = $5, numpuertas = $6, num_ejes = $7, fk_tipovehiculo = $8, fk_estacionamiento = $9, num_placa = $10
           WHERE vin = $12`,
          [
              idMarca.id_marca,
              submarca,
              modelo,
              idCombustible.id_combustible,
              idTransmision.id_transmision,
              numpuertas,
              numejes,
              idTipoVehiculo.id_tipovehiculo,
              idEstacionamiento.id_estacionamiento,
              num_placa,
              vin
          ]
      );

      res.status(200).json({ message: 'Vehículo actualizado correctamente' });
  } catch (err) {
      res.status(500).json({ error: err.message });
      console.log('Hubo un error... ' + err.message);
  }
});

app.delete('/api/vehiculos/delete/:id', async (req, res) => {
  try {
      const { vin } = req.params;

      // Verificar si el vehículo existe
      const vehiculoExistente = await db.oneOrNone('SELECT vin FROM vehiculo WHERE vin = $1', [vin]);
      if (!vehiculoExistente) {
          return res.status(404).json({ error: 'Vehículo no encontrado' });
      }

      // Eliminar el vehículo
      await db.none('DELETE FROM vehiculo WHERE vin = $1', [vin]);

      res.status(200).json({ message: 'Vehículo eliminado correctamente' });
  } catch (err) {
      res.status(500).json({ error: err.message });
      console.log('Hubo un error... ' + err.message);
  }
});

app.listen(port, () => {
  console.log(`Backend corriendo en http://localhost:${port}`);
});
