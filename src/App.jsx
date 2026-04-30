import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Trash2, Plus, MessageCircle, Shield } from 'lucide-react';
import './parfumerie.css';
import goldenLogo from './assets/golden-essence-logo.png';

const WHATSAPP_NUMBER = '5493834000000'; // Reemplaza con tu número real de WhatsApp

function App() {
  const [perfumes, setPerfumes] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [form, setForm] = useState({ nombre: '', marca: '', precio: '', imagen_url: '' });
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPerfumes();
  }, []);

  async function fetchPerfumes() {
    setError(null);
    const { data, error: err } = await supabase.from('perfumes').select('*').order('created_at', { ascending: false });
    if (err) {
      setError('Error al cargar perfumes. Verifica tu conexión.');
      console.error('Supabase error:', err.message);
    } else {
      setPerfumes(data || []);
    }
  }

  async function addPerfume(e) {
    e.preventDefault();
    setError(null);
    const { error: err } = await supabase.from('perfumes').insert([form]);
    if (err) {
      setError('Error al agregar perfume: ' + err.message);
    } else {
      setForm({ nombre: '', marca: '', precio: '', imagen_url: '' });
      fetchPerfumes();
    }
  }

  async function deletePerfume(id) {
    if (confirm('¿Borrar este perfume?')) {
      setError(null);
      const { error: err } = await supabase.from('perfumes').delete().eq('id', id);
      if (err) {
        setError('Error al eliminar perfume: ' + err.message);
      } else {
        fetchPerfumes();
      }
    }
  }

  const sendWhatsApp = (p) => {
    const msg = encodeURIComponent(`¡Hola! Me interesa el perfume *${p.nombre}* (${p.marca}). ¿Tenés stock?`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  };

  const filteredPerfumes = perfumes.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.marca?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdminToggle = () => {
    if (!isAdmin) {
      const password = prompt('Ingresa contraseña de administrador:');
      if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
        setIsAdmin(true);
      } else if (password !== null) {
        alert('Contraseña incorrecta');
      }
    } else {
      setIsAdmin(false);
    }
  };

  return (
    <div style={{ background: '#000000', minHeight: '100vh' }}>
      {error && (
        <div style={{ background: '#1f0a0a', color: '#f87171', padding: '12px 24px', textAlign: 'center', fontWeight: 600, border: '1px solid #3b1010' }}>
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 12, background: 'none', border: 'none', color: '#f87171', fontWeight: 700, cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
      )}

      {/* Header tipo Parfumerie */}
      <header className="header-parfumerie">
        <div className="header-left">
          <img src={goldenLogo} alt="Golden Essence Logo" className="logo-img" />
          <nav className="menu-parfumerie">
            <a href="#">PERFUMES</a>
          </nav>
        </div>
        
        <div className="header-center">
          <div className="search-bar">
            <input
              type="text"
              placeholder="¿Qué perfume árabe buscás?"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <button className="admin-btn" onClick={handleAdminToggle}>
          <Shield size={16} style={{ verticalAlign: 'middle' }} /> <span className="admin-text">{isAdmin ? 'Ver Tienda' : 'Admin'}</span>
        </button>
      </header>

      {/* Admin */}
      {isAdmin && (
        <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 18, boxShadow: '0 2px 16px 0 rgba(0,0,0,0.07)', border: '1px solid #ececec', padding: 32 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>Agregar Nuevo Perfume</h2>
          <form onSubmit={addPerfume} className="admin-form">
            <input placeholder="Nombre" className="admin-input" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
            <input placeholder="Marca (Lattafa, Afnan...)" className="admin-input" value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} />
            <input placeholder="Precio" type="number" className="admin-input" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} required />
            <input placeholder="URL de la imagen" className="admin-input image-url-input" value={form.imagen_url} onChange={e => setForm({...form, imagen_url: e.target.value})} />
            <button className="admin-submit-btn">
              <Plus size={18} /> Guardar
            </button>
          </form>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid #ececec' }}><th>Nombre</th><th>Precio</th><th>Acción</th></tr></thead>
            <tbody>
              {perfumes.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f4f4f4' }}>
                  <td style={{ padding: 8 }}>{p.nombre}</td>
                  <td style={{ padding: 8 }}>${p.precio}</td>
                  <td style={{ padding: 8 }}><button onClick={() => deletePerfume(p.id)} style={{ color: '#e11d48', background: 'none', border: 'none' }}><Trash2 size={18}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tienda */}
      {!isAdmin && (
        <div className="cards-parfumerie">
          {filteredPerfumes.length === 0 ? (
            <p style={{ textAlign: 'center', gridColumn: '1 / -1', fontSize: '1.2rem', color: '#888' }}>No se encontraron perfumes.</p>
          ) : (
            filteredPerfumes.map(p => (
              <div key={p.id} className="card-parfumerie">
                <div className="img-container">
                  <img src={p.imagen_url || 'https://via.placeholder.com/300'} alt={p.nombre} />
                </div>
                <div className="content">
                  <div className="marca">{p.marca}</div>
                  <div className="nombre">{p.nombre}</div>
                  <div className="precio">${p.precio}</div>
                  <button onClick={() => sendWhatsApp(p)} className="btn-whatsapp">
                    <MessageCircle size={18} /> Consultar por WhatsApp
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default App;