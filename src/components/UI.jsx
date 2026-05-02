import { motion } from 'framer-motion';

export function Loader({ size = 'md', text }) {
  const sizes = { sm: 32, md: 48, lg: 64 };
  const s = sizes[size];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '60px 20px' }}>
      <div style={{ width: s, height: s, border: `3px solid rgba(200,16,46,0.2)`, borderTopColor: '#C8102E', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
      {text && <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>{text}</p>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function StatusBadge({ status }) {
  const labels = {
    pending: 'En attente', confirmed: 'Confirmée', processing: 'En traitement',
    shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée',
  };
  return (
    <span className={`badge badge-${status}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
      {labels[status] || status}
    </span>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div style={{ position: 'relative', paddingTop: 130, paddingBottom: 70, paddingLeft: '6%', paddingRight: '6%', background: 'var(--dark)', borderBottom: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(200,16,46,0.06) 0%, transparent 70%)' }} />
      <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }} style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(40px,6vw,80px)', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 16 }}>
          {title}
        </h1>
        {subtitle && <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', maxWidth: 540, lineHeight: 1.65 }}>{subtitle}</p>}
        {children && <div style={{ marginTop: 24 }}>{children}</div>}
      </motion.div>
    </div>
  );
}

export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>{icon}</div>
      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 28, color: '#fff', marginBottom: 10 }}>{title}</h3>
      <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', marginBottom: 32, lineHeight: 1.65 }}>{subtitle}</p>
      {action}
    </div>
  );
}

export function SectionCard({ children, style = {} }) {
  return (
    <div style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden', ...style }}>
      {children}
    </div>
  );
}
