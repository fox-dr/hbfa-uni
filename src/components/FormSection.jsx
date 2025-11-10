import React from "react";

export default function FormSection({ title, children }) {
  return (
    <section style={styles.section}>
      {title && <h4 style={styles.legend}>{title}</h4>}
      <div style={styles.body}>{children}</div>
    </section>
  );
}

const styles = {
  section: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginTop: 16 },
  legend: { margin: 0, marginBottom: 8, fontSize: '1.05rem', fontWeight: 700, color: '#374151' },
  body: { display: 'grid', gap: 12 },
};