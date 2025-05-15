import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleEditor from '../components/ModuleEditor';
import { IModule }  from '../api/modules';        // ← bon chemin

export default function PrerequisAdminPage() {
  const [mod, setMod]   = useState<IModule | null>(null);
  const navigate        = useNavigate();

  /* charge le module */
  useEffect(() => {
    fetch('/api/modules/prerequis')
      .then(r => {
        if (!r.ok) throw new Error('Module introuvable');
        return r.json();
      })
      .then(setMod)
      .catch(() => navigate('/'));
  }, [navigate]);

  const handleSave = (m: IModule) => {
    fetch(`/api/modules/${m.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(m),
    })
      .then(r => r.json())
      .then(setMod);
  };

  if (!mod) return <p>Chargement…</p>;
  return (
    <div>
      <h1>Administration du module « Prérequis »</h1>
      <ModuleEditor module={mod} onChange={handleSave} />
    </div>
  );
}