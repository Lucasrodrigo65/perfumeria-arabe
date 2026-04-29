import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Trash2, Plus, MessageCircle, Shield } from 'lucide-react';
import './parfumerie.css';

function App() {
  const [perfumes, setPerfumes] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [form, setForm] = useState({ nombre: '', marca: '', precio: '', imagen_url: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPerfumes();
  }, []);

  async function fetchPerfumes() {
    const { data } = await supabase.from('perfumes').select('*').order('created_at', { ascending: false });
    setPerfumes(data || []);
  }

  async function addPerfume(e) {
    e.preventDefault();
    await supabase.from('perfumes').insert([form]);
    setForm({ nombre: '', marca: '', precio: '', imagen_url: '' });
    fetchPerfumes();
  }

  async function deletePerfume(id) {
    if (confirm('¿Borrar este perfume?')) {
      await supabase.from('perfumes').delete().eq('id', id);
      fetchPerfumes();
    }
  }

  const sendWhatsApp = (p) => {
    const msg = encodeURIComponent(`¡Hola! Me interesa el perfume *${p.nombre}* (${p.marca}). ¿Tenés stock?`);
    window.open(`https://wa.me/5493834XXXXXX?text=${msg}`, '_blank'); // Reemplaza el número
  };

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      {/* Header tipo Parfumerie */}
      <header className="header-parfumerie">
        <div className="logo-parfumerie">Parfumerie.</div>
        <nav className="menu-parfumerie">
          <a href="#">PARFUSALE</a>
          <a href="#">FRAGANCIAS XXL</a>
          <a href="#">K-BEAUTY</a>
          <a href="#">FRAGANCIAS</a>
          <a href="#">MAQUILLAJE</a>
          <a href="#">TRATAMIENTO</a>
          <a href="#">CAPILAR</a>
          <a href="#">LANZAMIENTOS</a>
          <a href="#">MARCAS</a>
          <a href="#">REGALOS</a>
        </nav>
        <div className="search-bar">
          <input
            type="text"
            placeholder="¿Qué buscás?"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button onClick={() => setIsAdmin(!isAdmin)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 14, marginRight: 16 }}>
          <Shield size={16} style={{ verticalAlign: 'middle' }} /> {isAdmin ? 'Ver Tienda' : 'Admin'}
        </button>
      </header>

      {/* Admin */}
      {isAdmin ? (
        <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 18, boxShadow: '0 2px 16px 0 rgba(0,0,0,0.07)', border: '1px solid #ececec', padding: 32 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>Agregar Nuevo Perfume</h2>
          <form onSubmit={addPerfume} style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
            <input placeholder="Nombre" style={{ flex: 2, padding: 8, borderRadius: 8, border: '1px solid #ececec' }} value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
            <input placeholder="Marca (Lattafa, Afnan...)" style={{ flex: 2, padding: 8, borderRadius: 8, border: '1px solid #ececec' }} value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} />
            <input placeholder="Precio" type="number" style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #ececec' }} value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} required />
            <input placeholder="URL de la imagen" style={{ flex: 3, padding: 8, borderRadius: 8, border: '1px solid #ececec' }} value={form.imagen_url} onChange={e => setForm({...form, imagen_url: e.target.value})} />
            <button style={{ background: '#c084fc', color: '#fff', border: 'none', borderRadius: 8, padding: '0 18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={18} /> Guardar Perfume
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
      ) : (
        <div className="cards-parfumerie">
          {perfumes.filter(p =>
            p.nombre.toLowerCase().includes(search.toLowerCase()) ||
            p.marca?.toLowerCase().includes(search.toLowerCase())
          ).map(p => (
            <div key={p.id} className="card-parfumerie">
              <img src={p.imagen_url || 'https://via.placeholder.com/300'} alt={p.nombre} />
              <div style={{ padding: 24 }}>
                <div className="marca">{p.marca}</div>
                <div className="nombre">{p.nombre}</div>
                <div className="precio">${p.precio}</div>
                <button onClick={() => sendWhatsApp(p)} className="btn-whatsapp">
                  <MessageCircle size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Consultar por WhatsApp
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {isAdmin && (
        <div className="mt-12 overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b border-slate-700"><th>Nombre</th><th>Precio</th><th>Acción</th></tr></thead>
            <tbody>
              {perfumes.map(p => (
                <tr key={p.id} className="border-b border-slate-800">
                  <td className="py-2">{p.nombre}</td>
                  <td>${p.precio}</td>
                  <td><button onClick={() => deletePerfume(p.id)} className="text-red-400"><Trash2 size={18}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;