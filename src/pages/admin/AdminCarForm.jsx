import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { carAPI } from '../../services/api';
import { useToastStore } from '../../store';

const EMPTY = { make:'', model:'', year:new Date().getFullYear(), price:'', stock:1, description:'', fuelType:'Essence', transmission:'Automatique', mileage:0, color:'', power:'', category:'Berline', imageUrl:'', imageUrl2:'', imageUrl3:'', minSalary:'', featured:false, isActive:true };

export default function AdminCarForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const isEdit = !!id && id !== 'new';
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      carAPI.getById(id).then(r => {
        const c = r.data.car;
        setForm({ ...EMPTY, ...c, price:String(c.price), minSalary:String(c.minSalary||''), power:String(c.power||'') });
      });
    }
  }, [id, isEdit]);

  const set = (f) => (e) => {
    const val = e.target.type==='checkbox' ? e.target.checked : e.target.value;
    setForm(p => ({ ...p, [f]:val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) { await carAPI.update(id, form); addToast('Véhicule mis à jour', 'success'); }
      else         { await carAPI.create(form);    addToast('Véhicule créé', 'success'); }
      navigate('/admin/cars');
    } catch (err) { addToast(err.response?.data?.error || 'Erreur', 'error'); }
    finally { setSaving(false); }
  };

  const Section = ({ title, children }) => (
    <div style={{ background:'var(--dark-2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:28, marginBottom:20 }}>
      <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'#C8102E', marginBottom:22 }}>{title}</p>
      {children}
    </div>
  );

  const Field = ({ label, field, type='text', placeholder, opts, half, rows }) => (
    <div>
      <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', marginBottom:10 }}>{label}</label>
      {opts ? (
        <select value={form[field]} onChange={set(field)} className="input-luxury" style={{ fontSize:15 }}>
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : rows ? (
        <textarea value={form[field]} onChange={set(field)} rows={rows} placeholder={placeholder} className="input-luxury" style={{ resize:'none', fontSize:15 }} />
      ) : (
        <input type={type} value={form[field]} onChange={set(field)} placeholder={placeholder} className="input-luxury" style={{ fontSize:15 }} />
      )}
    </div>
  );

  return (
    <div style={{ padding:'48px 44px 60px', minHeight:'100vh', background:'var(--black)' }}>
      <div style={{ marginBottom:36 }}>
        <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'#C8102E', marginBottom:10 }}>{isEdit?'Modifier':'Ajouter'}</p>
        <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:48, color:'#fff', letterSpacing:'-0.02em' }}>
          {isEdit ? 'Modifier le véhicule' : 'Nouveau véhicule'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth:780 }}>
        <Section title="Informations principales">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            <Field label="Marque *" field="make" placeholder="Toyota" />
            <Field label="Modèle *" field="model" placeholder="Camry" />
            <Field label="Année *" field="year" type="number" placeholder="2024" />
            <Field label="Prix (€) *" field="price" type="number" placeholder="25000" />
            <Field label="Stock *" field="stock" type="number" placeholder="3" />
          </div>
          <Field label="Description" field="description" rows={4} placeholder="Description détaillée du véhicule..." />
        </Section>

        <Section title="Caractéristiques techniques">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <Field label="Carburant" field="fuelType" opts={['Essence','Diesel','Electrique','Hybride']} />
            <Field label="Transmission" field="transmission" opts={['Automatique','Manuelle']} />
            <Field label="Catégorie" field="category" opts={['Berline','SUV','Citadine','Break','Coupe','Cabriolet','Utilitaire']} />
            <Field label="Kilométrage" field="mileage" type="number" placeholder="0" />
            <Field label="Puissance (hp)" field="power" type="number" placeholder="150" />
            <Field label="Couleur" field="color" placeholder="Blanc Nacré" />
          </div>
        </Section>

        <Section title="Images & Financement">
          <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:20 }}>
            <Field label="URL Image principale" field="imageUrl" placeholder="https://images.unsplash.com/..." />
            <Field label="URL Image 2" field="imageUrl2" placeholder="https://..." />
            <Field label="URL Image 3" field="imageUrl3" placeholder="https://..." />
            <Field label="Salaire minimum recommandé (€/mois)" field="minSalary" type="number" placeholder="2000" />
          </div>
          {/* Preview */}
          {form.imageUrl && (
            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(255,255,255,0.25)', marginBottom:10 }}>Aperçu</p>
              <img src={form.imageUrl} alt="Aperçu" style={{ width:'100%', maxHeight:200, objectFit:'cover', borderRadius:8 }}
                onError={e => e.target.style.display='none'} />
            </div>
          )}
          <div style={{ display:'flex', gap:24 }}>
            {[['featured','Véhicule vedette (★ Top)'],['isActive','Actif (visible en catalogue)']].map(([f,l]) => (
              <label key={f} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                <input type="checkbox" checked={form[f]} onChange={set(f)} style={{ accentColor:'#C8102E', width:18, height:18 }} />
                <span style={{ fontSize:14, color:'rgba(255,255,255,0.6)', fontWeight:500 }}>{l}</span>
              </label>
            ))}
          </div>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.2)', marginTop:14 }}>
            💡 La mensualité est calculée automatiquement (6%/an, 60 mois).
          </p>
        </Section>

        <div style={{ display:'flex', gap:14 }}>
          <button type="submit" disabled={saving} className="btn-primary" style={{ fontSize:15, padding:'16px 32px' }}>
            {saving ? 'Enregistrement...' : isEdit ? '✓ Mettre à jour' : '+ Créer le véhicule'}
          </button>
          <button type="button" onClick={() => navigate('/admin/cars')} className="btn-ghost" style={{ fontSize:15, padding:'16px 32px' }}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
