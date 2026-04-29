import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Trash2, Plus, MessageCircle, Shield } from 'lucide-react';

function App() {
  const [perfumes, setPerfumes] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [form, setForm] = useState({ nombre: '', marca: '', precio: '', imagen_url: '' });

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
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
      <header className="flex justify-between items-center mb-12 border-b border-slate-700 pb-4">
        <h1 className="text-3xl font-bold tracking-tighter text-amber-500">ARABIAN SCENTS</h1>
        <button onClick={() => setIsAdmin(!isAdmin)} className="flex items-center gap-2 text-xs opacity-50 hover:opacity-100">
          <Shield size={14} /> {isAdmin ? 'Ver Tienda' : 'Admin'}
        </button>
      </header>

      {isAdmin ? (
        <div className="max-w-md mx-auto bg-slate-800 p-6 rounded-xl shadow-2xl">
          <h2 className="text-xl mb-4 font-semibold">Agregar Nuevo Perfume</h2>
          <form onSubmit={addPerfume} className="flex flex-col gap-3 text-slate-900">
            <input placeholder="Nombre" className="p-2 rounded" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
            <input placeholder="Marca (Lattafa, Afnan...)" className="p-2 rounded" value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} />
            <input placeholder="Precio" type="number" className="p-2 rounded" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} required />
            <input placeholder="URL de la imagen" className="p-2 rounded" value={form.imagen_url} onChange={e => setForm({...form, imagen_url: e.target.value})} />
            <button className="bg-amber-500 text-white p-2 rounded font-bold mt-2 flex justify-center items-center gap-2">
              <Plus size={18} /> Guardar Perfume
            </button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {perfumes.map(p => (
            <div key={p.id} className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-amber-500 transition-all group">
              <div className="h-64 bg-slate-700 overflow-hidden">
                <img src={p.imagen_url || 'https://via.placeholder.com/300'} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-5">
                <p className="text-xs text-amber-500 uppercase tracking-widest">{p.marca}</p>
                <h3 className="text-xl font-bold mb-2">{p.nombre}</h3>
                <p className="text-2xl font-light text-slate-300 mb-6">${p.precio}</p>
                <button onClick={() => sendWhatsApp(p)} className="w-full bg-green-600 hover:bg-green-500 p-3 rounded-lg flex justify-center items-center gap-2 font-bold transition-colors">
                  <MessageCircle size={20} /> Consultar por WhatsApp
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Listado de gestión para el admin */}
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