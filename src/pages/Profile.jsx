import { useState } from 'react';
import { userAPI } from '../services/api';
import { useAuthStore, useToastStore, useLangStore } from '../store';
import { getInitials } from '../utils/helpers';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const { addToast } = useToastStore();
  const { lang } = useLangStore();
  const [profile, setProfile] = useState({ firstName:user?.firstName||'', lastName:user?.lastName||'', phone:user?.phone||'', address:user?.address||'', monthlySalary:user?.monthlySalary||'' });
  const [pwd, setPwd] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const L = {
    title:    { fr:'Mon Profil', en:'My Profile', de:'Mein Profil', ar:'ملفي' },
    label:    { fr:'Mon compte', en:'My account', de:'Mein Konto', ar:'حسابي' },
    personal: { fr:'Informations personnelles', en:'Personal information', de:'Persönliche Daten', ar:'المعلومات الشخصية' },
    fname:    { fr:'Prénom', en:'First name', de:'Vorname', ar:'الاسم الأول' },
    lname:    { fr:'Nom', en:'Last name', de:'Nachname', ar:'الاسم الأخير' },
    phone:    { fr:'Téléphone', en:'Phone', de:'Telefon', ar:'الهاتف' },
    address:  { fr:'Adresse', en:'Address', de:'Adresse', ar:'العنوان' },
    salary:   { fr:'Salaire mensuel (€)', en:'Monthly salary (€)', de:'Monatsgehalt (€)', ar:'الراتب الشهري (€)' },
    save:     { fr:'Enregistrer les modifications', en:'Save changes', de:'Änderungen speichern', ar:'حفظ التغييرات' },
    saving:   { fr:'Enregistrement...', en:'Saving...', de:'Wird gespeichert...', ar:'جارٍ الحفظ...' },
    pwdSection:{ fr:'Changer le mot de passe', en:'Change password', de:'Passwort ändern', ar:'تغيير كلمة المرور' },
    current:  { fr:'Mot de passe actuel', en:'Current password', de:'Aktuelles Passwort', ar:'كلمة المرور الحالية' },
    newPwd:   { fr:'Nouveau mot de passe', en:'New password', de:'Neues Passwort', ar:'كلمة مرور جديدة' },
    confirmPwd:{ fr:'Confirmer le nouveau mot de passe', en:'Confirm new password', de:'Passwort bestätigen', ar:'تأكيد كلمة المرور الجديدة' },
    changePwd:{ fr:'Changer le mot de passe', en:'Change password', de:'Passwort ändern', ar:'تغيير كلمة المرور' },
    changingPwd:{ fr:'Modification...', en:'Changing...', de:'Wird geändert...', ar:'جارٍ التغيير...' },
    successProfile:{ fr:'Profil mis à jour avec succès', en:'Profile updated successfully', de:'Profil erfolgreich aktualisiert', ar:'تم تحديث الملف بنجاح' },
    successPwd:{ fr:'Mot de passe modifié avec succès', en:'Password changed successfully', de:'Passwort erfolgreich geändert', ar:'تم تغيير كلمة المرور بنجاح' },
    errMatch: { fr:'Les mots de passe ne correspondent pas', en:'Passwords do not match', de:'Passwörter stimmen nicht überein', ar:'كلمتا المرور غير متطابقتين' },
  };

  const handleProfile = async (e) => {
    e.preventDefault(); setSavingProfile(true);
    try {
      const { data } = await userAPI.updateProfile(profile);
      updateUser(data.user);
      addToast(L.successProfile[lang], 'success');
    } catch (err) { addToast(err.response?.data?.error || 'Erreur', 'error'); }
    finally { setSavingProfile(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirmPassword) { addToast(L.errMatch[lang], 'error'); return; }
    setSavingPwd(true);
    try {
      await userAPI.changePassword({ currentPassword:pwd.currentPassword, newPassword:pwd.newPassword });
      setPwd({ currentPassword:'', newPassword:'', confirmPassword:'' });
      addToast(L.successPwd[lang], 'success');
    } catch (err) { addToast(err.response?.data?.error || 'Erreur', 'error'); }
    finally { setSavingPwd(false); }
  };

  const Field = ({ label, type='text', value, onChange, placeholder }) => (
    <div>
      <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', marginBottom:10 }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="input-luxury" style={{ fontSize:16 }} />
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--black)', paddingTop:76 }}>
      <div style={{ padding:'64px 6% 48px', background:'var(--dark)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          <div style={{ width:68, height:68, borderRadius:'50%', background:'linear-gradient(135deg,#9B0B22,#C8102E)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:22, color:'#fff', letterSpacing:'-0.01em' }}>
            {getInitials(user?.firstName, user?.lastName)}
          </div>
          <div>
            <div className="section-eyebrow">{L.label[lang]}</div>
            <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(36px,5vw,64px)', color:'#fff', letterSpacing:'-0.02em' }}>{L.title[lang]}</h1>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:620, margin:'0 auto', padding:'48px 6%' }}>
        {/* Profile form */}
        <form onSubmit={handleProfile} style={{ background:'var(--dark-2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:32, marginBottom:20 }}>
          <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'#C8102E', marginBottom:24 }}>{L.personal[lang]}</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            <Field label={L.fname[lang]} value={profile.firstName} onChange={e => setProfile(p=>({...p,firstName:e.target.value}))} />
            <Field label={L.lname[lang]} value={profile.lastName} onChange={e => setProfile(p=>({...p,lastName:e.target.value}))} />
          </div>
          <div style={{ marginBottom:16 }}><Field label={L.phone[lang]} value={profile.phone} onChange={e => setProfile(p=>({...p,phone:e.target.value}))} placeholder="+49 157..." /></div>
          <div style={{ marginBottom:16 }}><Field label={L.address[lang]} value={profile.address} onChange={e => setProfile(p=>({...p,address:e.target.value}))} placeholder="Rue, ville..." /></div>
          <div style={{ marginBottom:28 }}><Field label={L.salary[lang]} type="number" value={profile.monthlySalary} onChange={e => setProfile(p=>({...p,monthlySalary:e.target.value}))} placeholder="3000" /></div>
          <button type="submit" disabled={savingProfile} className="btn-primary" style={{ fontSize:14, padding:'14px 28px' }}>
            {savingProfile ? L.saving[lang] : '✓ '+L.save[lang]}
          </button>
        </form>

        {/* Password form */}
        <form onSubmit={handlePassword} style={{ background:'var(--dark-2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:32 }}>
          <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'#C8102E', marginBottom:24 }}>{L.pwdSection[lang]}</p>
          <div style={{ marginBottom:16 }}><Field label={L.current[lang]} type="password" value={pwd.currentPassword} onChange={e => setPwd(p=>({...p,currentPassword:e.target.value}))} /></div>
          <div style={{ marginBottom:16 }}><Field label={L.newPwd[lang]} type="password" value={pwd.newPassword} onChange={e => setPwd(p=>({...p,newPassword:e.target.value}))} /></div>
          <div style={{ marginBottom:28 }}><Field label={L.confirmPwd[lang]} type="password" value={pwd.confirmPassword} onChange={e => setPwd(p=>({...p,confirmPassword:e.target.value}))} /></div>
          <button type="submit" disabled={savingPwd} className="btn-ghost" style={{ fontSize:14, padding:'14px 28px' }}>
            {savingPwd ? L.changingPwd[lang] : '🔒 '+L.changePwd[lang]}
          </button>
        </form>
      </div>
    </div>
  );
}
