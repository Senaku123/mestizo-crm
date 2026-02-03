import { useState } from 'react';
import { api } from '../api/client';
import { ImportResponse } from '../types';

export default function ImportData() {
    const [customerFile, setCustomerFile] = useState<File | null>(null);
    const [leadFile, setLeadFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ type: string; data: ImportResponse } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleImport = async (type: 'customers' | 'leads', file: File | null) => {
        if (!file) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await api.uploadFile<ImportResponse>(`/import/${type}/`, file);
            setResult({ type, data });
            if (type === 'customers') setCustomerFile(null);
            if (type === 'leads') setLeadFile(null);
        } catch (err) {
            setError(`Error al importar ${type === 'customers' ? 'clientes' : 'leads'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1>📥 Importar Datos</h1>
            </div>

            <div className="alert alert-info">
                <strong>Formato CSV requerido:</strong> La primera fila debe contener los nombres de columnas.
                Los campos soportados son: name/nombre, phone/telefono, email, type/tipo, notes/notas, source/fuente.
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {result && (
                <div className="alert alert-success">
                    <strong>¡Importación exitosa!</strong> Se crearon {result.data.created} {result.type === 'customers' ? 'clientes' : 'leads'}.
                    {result.data.errors.length > 0 && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <strong>Errores ({result.data.errors.length}):</strong>
                            <ul style={{ marginTop: '0.25rem', paddingLeft: '1.5rem' }}>
                                {result.data.errors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Import Customers */}
                <div className="card">
                    <h2 style={{ marginBottom: '1rem' }}>👥 Importar Clientes</h2>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '1rem' }}>
                        Importa clientes desde un archivo CSV con columnas: name, type, phone, email, notes
                    </p>

                    <div className="form-group">
                        <label>Archivo CSV</label>
                        <input
                            type="file"
                            accept=".csv"
                            className="form-control"
                            onChange={(e) => setCustomerFile(e.target.files?.[0] || null)}
                        />
                    </div>

                    <button
                        className="btn btn-primary"
                        disabled={!customerFile || isLoading}
                        onClick={() => handleImport('customers', customerFile)}
                    >
                        {isLoading ? <><div className="spinner"></div> Importando...</> : '📤 Importar Clientes'}
                    </button>

                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                        <strong>Ejemplo de CSV:</strong>
                        <pre style={{ marginTop: '0.5rem', fontSize: '0.8rem', overflow: 'auto' }}>
                            {`name,type,phone,email,notes
Juan Pérez,INDIVIDUAL,011-1234-5678,juan@email.com,Cliente frecuente
Empresa ABC,COMPANY,011-9876-5432,contacto@abc.com,Cuenta corporativa`}
                        </pre>
                    </div>
                </div>

                {/* Import Leads */}
                <div className="card">
                    <h2 style={{ marginBottom: '1rem' }}>🌱 Importar Leads</h2>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '1rem' }}>
                        Importa leads desde un archivo CSV con columnas: name, phone, email, source, notes
                    </p>

                    <div className="form-group">
                        <label>Archivo CSV</label>
                        <input
                            type="file"
                            accept=".csv"
                            className="form-control"
                            onChange={(e) => setLeadFile(e.target.files?.[0] || null)}
                        />
                    </div>

                    <button
                        className="btn btn-primary"
                        disabled={!leadFile || isLoading}
                        onClick={() => handleImport('leads', leadFile)}
                    >
                        {isLoading ? <><div className="spinner"></div> Importando...</> : '📤 Importar Leads'}
                    </button>

                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                        <strong>Ejemplo de CSV:</strong>
                        <pre style={{ marginTop: '0.5rem', fontSize: '0.8rem', overflow: 'auto' }}>
                            {`name,phone,email,source,notes
María López,011-5555-1234,maria@email.com,WEB,Consulta por jardín
Pedro Gómez,011-4444-5678,pedro@email.com,IG,Siguió por Instagram`}
                        </pre>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                            <strong>Valores válidos para source:</strong> WEB, IG, WHATSAPP, REFERRAL, OTHER
                        </div>
                    </div>
                </div>
            </div>

            {/* Tips */}
            <div className="card" style={{ marginTop: '1.5rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>💡 Consejos</h2>
                <ul style={{ color: 'var(--color-text-light)', paddingLeft: '1.5rem' }}>
                    <li>Asegúrate de que el archivo CSV use comas (,) como separador</li>
                    <li>El archivo debe estar codificado en UTF-8</li>
                    <li>Los campos opcionales pueden dejarse vacíos</li>
                    <li>Los valores de tipo y fuente deben coincidir exactamente con los permitidos</li>
                    <li>Máximo recomendado: 1000 registros por archivo</li>
                </ul>
            </div>
        </div>
    );
}
