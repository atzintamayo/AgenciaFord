import React from "react";
import { useEffect, useState } from "react";

// Definir el tipo de datos que recibimos del backend
interface Auto {
  vin: string;
  marca: string;
  submarca: string;
  modelo: string;
  combustible: string;
  transmision: string;
  tipo_auto: string;
  fecha_entrada: string;
  fecha_salida: string | null;
  ubicacion: string;
  num_placa: string;
}

export const AutoList = () => {
  const [autos, setAutos] = useState<Auto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener los datos del backend
  useEffect(() => {
    const fetchAutos = async () => {
      try {
        const response = await fetch("http://localhost:3000/api");
        if (!response.ok) {
          throw new Error("Error al obtener los autos");
        }
        const data: Auto[] = await response.json();
        setAutos(data);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchAutos();
  }, []);

  // Mostrar mensaje de carga
  if (loading) return <p>Cargando autos...</p>;
  
  // Mostrar mensaje de error si falla la API
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="autos-container">
      {autos.length === 0 ? (
        <p>No hay autos disponibles.</p>
      ) : (
        autos.map((auto) => (
          <div key={auto.vin} className="products-row">
            <button className="cell-more-button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-more-vertical"
              >
                <circle cx={12} cy={12} r={1} />
                <circle cx={12} cy={5} r={1} />
                <circle cx={12} cy={19} r={1} />
              </svg>
            </button>

            <div className="product-cell image">
              <img
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                alt="auto"
              />
              <span className="cell-label">Marca:</span>
              <span>{auto.marca}</span>
            </div>

            <div className="product-cell category">
              <span className="cell-label">Submarca:</span>
              <span>{auto.submarca}</span>
            </div>

            <div className="product-cell status-cell">
              <span className="cell-label">Modelo:</span>
              <span className="status active">{auto.modelo}</span>
            </div>

            <div className="product-cell sales">
              <span className="cell-label">Combustible:</span>
              <span>{auto.combustible}</span>
            </div>

            <div className="product-cell stock">
              <span className="cell-label">Transmisión:</span>
              <span>{auto.transmision}</span>
            </div>

            <div className="product-cell price">
              <span className="cell-label">Tipo de Auto:</span>
              <span>{auto.tipo_auto}</span>
            </div>

            <div className="product-cell price">
              <span className="cell-label">Placa:</span>
              <span>{auto.num_placa}</span>
            </div>
            /* 
            <div className="product-cell price">
              <span className="cell-label">Ubicación:</span>
              <span>{auto.ubicacion}</span>
            </div>

            <div className="product-cell price">
              <span className="cell-label">Fecha de Entrada:</span>
              <span>{auto.fecha_entrada}</span>
            </div>

            <div className="product-cell price">
              <span className="cell-label">Fecha de Salida:</span>
              <span>{auto.fecha_salida || "N/A"}</span>
            </div>
            */
            <div className="product-cell price">
              <span className="cell-label">VIN:</span>
              <span>{auto.vin}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};



interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const [formType, setFormType] = useState<string | null>(null);

  const handleFormSelection = (type: string) => {
    setFormType(type);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>

        {/* Siempre se muestra el children */}
        {children}

        {/* Si no se ha seleccionado un formulario, muestra las opciones */}
        {!formType ? (
          <div className="flex flex-col gap-4 mt-4">
            <button onClick={() => handleFormSelection("nuevo")}>Auto Nuevo</button>
            <button onClick={() => handleFormSelection("seminuevo")}>Auto Seminuevo</button>
            <button onClick={() => handleFormSelection("interno")}>Auto de uso interno</button>
          </div>
        ) : (
          // Finalmente, muestra el formulario seleccionado
          <Form formType={formType} />
        )}
      </div>
    </div>
  );
};


interface FormProps {
  formType: string;
}

const Form: React.FC<FormProps> = ({ formType }) => {
  const commonFields = ['Modelo', 'Marca', 'Submarca', 'Transmisión', 'Tipo de Combustible', 'No. de serie del motor'];
  const extraFields = {
    seminuevo: ['Vigencia de seguro', 'Número de placas'],
    interno: ['Seguro', 'Número de placas'],
  };

  const fields = formType === 'nuevo' ? commonFields : [...commonFields, ...(extraFields[formType as keyof typeof extraFields] || [])];

    // Estado para almacenar los valores del formulario
    const [formData, setFormData] = useState<{ [key: string]: string }>({});

    // Maneja cambios en los inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    };
  
    // Maneja el envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = Object.fromEntries(formData.entries());
    
      try {
        const response = await fetch('http://localhost:3000/autos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
    
        const result = await response.json();
        if (result.success) {
          alert('Auto agregado exitosamente');
        } else {
          alert(result.message);  // Muestra el error detallado desde el backend
        }
      } catch (error) {
        console.error('Error al enviar la solicitud:', error);
        alert('Error en la solicitud');
      }
    };
    return (
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {fields.map((field) => (
          <label key={field} className="flex flex-col">
            {field}:
            <input
              type="text"
              name={field.toLowerCase().replace(/ /g, "_")}
              className="border p-2 rounded"
              onChange={handleChange}
            />
          </label>
        ))}
        <button type="submit">Enviar</button>
      </form>
    );
  };
  
  export default Form;


