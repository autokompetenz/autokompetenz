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
  const [imageFiles, setImageFiles] = useState({ image1: null, image2: null, image3: null });
  const [previews, setPreviews] = useState({ image1: null, image2: null, image3: null });
  const [primaryImage, setPrimaryImage] = useState('image1');

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

  const handleImageChange = (imageKey) => (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast('Image trop volumineuse (max 5MB)', 'error');
        return;
      }
      
      setImageFiles(prev => ({ ...prev, [imageKey]: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [imageKey]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const setAsPrimary = (imageKey) => {
    setPrimaryImage(imageKey);
    addToast('Image principale définie', 'success');
  };

  const removeImage = (imageKey) => {
    setImageFiles(prev => ({ ...prev, [imageKey]: null }));
    setPreviews(prev => ({ ...prev, [imageKey]: null }));
    if (primaryImage === imageKey) {
      setPrimaryImage('image1');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      
      Object.keys(form).forEach(key => {
        if (key !== 'imageUrl' && key !== 'imageUrl2' && key !== 'imageUrl3') {
          formData.append(key, form[key]);
        }
      });
      
      if (imageFiles.image1) formData.append('image1', imageFiles.image1);
      if (imageFiles.image2) formData.append('image2', imageFiles.image2);
      if (imageFiles.image3) formData.append('image3', imageFiles.image3);
      
      if (isEdit) { 
        await carAPI.update(id, formData); 
        addToast('Véhicule mis à jour', 'success'); 
      } else { 
        await carAPI.create(formData);    
        addToast('Véhicule créé', 'success'); 
      }
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

        <Section title="Images">
          <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:12 }}>
              {['image1', 'image2', 'image3'].map((imageKey, index) => (
                <div key={imageKey} style={{ position:'relative' }}>
                  <div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange(imageKey)}
                      style={{ display:'none' }} 
                      id={`${imageKey}-input`}
                    />
                    <label 
                      htmlFor={`${imageKey}-input`}
                      style={{ 
                        display:'block', 
                        padding:'12px 16px', 
                        background:'var(--dark-2)', 
                        border: primaryImage === imageKey ? '2px solid #C8102E' : '1px solid rgba(255,255,255,0.1)', 
                        borderRadius:8, 
                        cursor:'pointer', 
                        fontSize:14, 
                        color:'rgba(255,255,255,0.6)',
                        transition:'all 0.3s',
                        textAlign:'center'
                      }}
                      onMouseOver={e => { e.currentTarget.style.borderColor='rgba(200,16,46,0.3)'; e.currentTarget.style.color='rgba(255,255,255,0.8)'; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor=primaryImage === imageKey ? '#C8102E' : 'rgba(255,255,255,0.1)'; e.currentTarget.style.color='rgba(255,255,255,0.6)'; }}
                    >
                      {previews[imageKey] ? (
                        <div style={{ position:'relative' }}>
                          <img src={previews[imageKey]} alt={`Aperçu ${index + 1}`} style={{ width:'100%', height:120, objectFit:'cover', borderRadius:6 }} />
                          <div style={{ position:'absolute', top:4, right:4, background:'#C8102E', color:'#fff', borderRadius:'50%', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:'bold' }}>
                            {primaryImage === imageKey ? '★' : index + 1}
                          </div>
                        </div>
                      ) : (
                        <div style={{ padding:20, textAlign:'center', color:'rgba(255,255,255,0.4)' }}>
                          📷<br/>
                          <span style={{ fontSize:12 }}>Image {index + 1}</span>
                        </div>
                      )}
                    </label>
                    {previews[imageKey] && (
                      <button
                        type="button"
                        onClick={() => removeImage(imageKey)}
                        style={{
                          position:'absolute',
                          top:4,
                          left:4,
                          background:'rgba(0,0,0,0.7)',
                          color:'#fff',
                          border:'none',
                          borderRadius:'50%',
                          width:16,
                          height:16,
                          cursor:'pointer',
                          display:'flex',
                          alignItems:'center',
                          justifyContent:'center',
                          fontSize:10,
                          fontWeight:'bold'
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:6, textAlign:'center' }}>
                    {primaryImage === imageKey ? 'Principale' : `Image ${index + 1}`}
                  </p>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop:16, padding:12, background:'rgba(200,16,46,0.1)', borderRadius:8, border:'1px solid rgba(200,16,46,0.2)' }}>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.8)', marginBottom:8, fontWeight:600 }}>💡 Conseils</p>
              <ul style={{ fontSize:11, color:'rgba(255,255,255,0.6)', lineHeight:1.6, margin:0, paddingLeft:16 }}>
                <li style={{ marginBottom:4 }}>Cliquez sur une image pour la définir comme principale (★)</li>
                <li style={{ marginBottom:4 }}>Formats acceptés : JPG, PNG, WebP (max 5MB)</li>
                <li style={{ marginBottom:4 }}>L'image principale sera affichée en premier dans la galerie</li>
              </ul>
            </div>
          </div>
        </Section>

        <Section title="Options">
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
