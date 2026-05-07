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
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const validFiles = files.filter(file => {
        if (file.size > 5 * 1024 * 1024) {
          addToast(`Image ${file.name} trop volumineuse (max 5MB)`, 'error');
          return false;
        }
        return true;
      });
      
      setImageFiles(prev => [...prev, ...validFiles]);
      
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, { 
            file: file,
            url: reader.result,
            id: Date.now() + Math.random()
          }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (imageId) => {
    setImageFiles(prev => prev.filter(f => f !== imageId));
    setPreviews(prev => prev.filter(p => p.id !== imageId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      console.log('=== Frontend Debug ===');
      console.log('Form data:', form);
      console.log('Image files:', imageFiles);
      
      const formData = new FormData();
      
      // Add all form fields with explicit checks
      if (form.make) formData.append('make', form.make);
      if (form.model) formData.append('model', form.model);
      if (form.year) formData.append('year', form.year);
      if (form.price) formData.append('price', form.price);
      if (form.stock) formData.append('stock', form.stock);
      if (form.description) formData.append('description', form.description);
      if (form.fuelType) formData.append('fuelType', form.fuelType);
      if (form.transmission) formData.append('transmission', form.transmission);
      if (form.mileage) formData.append('mileage', form.mileage);
      if (form.color) formData.append('color', form.color);
      if (form.power) formData.append('power', form.power);
      if (form.category) formData.append('category', form.category);
      if (form.minSalary) formData.append('minSalary', form.minSalary);
      formData.append('featured', form.featured);
      formData.append('isActive', form.isActive);
      if (form.imageUrl) formData.append('imageUrl', form.imageUrl);
      
      // Add image files
      imageFiles.forEach((file, index) => {
        formData.append(`image${index + 1}`, file);
      });
      
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      
      if (isEdit) { 
        await carAPI.update(id, formData); 
        addToast('Véhicule mis à jour', 'success'); 
      } else { 
        await carAPI.create(formData);    
        addToast('Véhicule créé', 'success'); 
      }
      navigate('/admin/cars');
    } catch (err) { 
      console.error('Submit error:', err);
      addToast(err.response?.data?.error || 'Erreur', 'error'); 
    }
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
        <select 
          name={field}
          value={form[field]} 
          onChange={set(field)} 
          className="input-luxury" 
          style={{ fontSize:15 }}
        >
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : rows ? (
        <textarea 
          name={field}
          value={form[field]} 
          onChange={set(field)} 
          rows={rows} 
          placeholder={placeholder} 
          className="input-luxury" 
          style={{ resize:'none', fontSize:15 }}
        />
      ) : (
        <input 
          name={field}
          type={type} 
          value={form[field]} 
          onChange={set(field)} 
          placeholder={placeholder} 
          className="input-luxury" 
          style={{ fontSize:15 }}
        />
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
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', marginBottom:10 }}>Images *</label>
              <input 
                type="file" 
                accept="image/*" 
                multiple
                onChange={handleImageChange}
                style={{ display:'none' }} 
                id="images-input"
              />
              <label 
                htmlFor="images-input"
                style={{ 
                  display:'block', 
                  padding:'12px 16px', 
                  background:'var(--dark-2)', 
                  border:'1px solid rgba(255,255,255,0.1)', 
                  borderRadius:8, 
                  cursor:'pointer', 
                  fontSize:14, 
                  color:'rgba(255,255,255,0.6)',
                  transition:'all 0.3s'
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor='rgba(200,16,46,0.3)'; e.currentTarget.style.color='rgba(255,255,255,0.8)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.color='rgba(255,255,255,0.6)'; }}
              >
                📷 {imageFiles.length > 0 ? `${imageFiles.length} image(s) sélectionnée(s)` : 'Choisir des images'}
              </label>
            </div>
          </div>
        </Section>

        {previews.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(255,255,255,0.25)', marginBottom:10 }}>Aperçu ({previews.length} image{previews.length > 1 ? 's' : ''})</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:12 }}>
              {previews.map((preview, index) => (
                <div key={preview.id} style={{ position:'relative' }}>
                  <img src={preview.url} alt={`Aperçu ${index + 1}`} style={{ width:'100%', height:150, objectFit:'cover', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)' }} />
                  <button
                    type="button"
                    onClick={() => removeImage(preview.id)}
                    style={{
                      position:'absolute',
                      top:4,
                      right:4,
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
                  <div style={{ position:'absolute', top:4, left:4, background:'#C8102E', color:'#fff', borderRadius:'50%', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:'bold' }}>
                    {index === 0 ? '★' : index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
