// client/src/pages/AdminModulesPage.tsx

import React, { useEffect, useState } from 'react';
import { Link, useNavigate }          from 'react-router-dom';
import { getModules, IModule, updateModule } from '../api/modules';
import { useAuth } from '../context/AuthContext';

import './AdminModulesPage.css';

export default function AdminModulesPage() {
  const [mods, setMods] = useState<IModule[]>([]);
  const { user } = useAuth();
  const basePath = user?.role === 'manager' ? '/manager' : '/admin';

  const navigate        = useNavigate();

  /* ───── chargement initial ───── */
  useEffect(() => { getModules().then(setMods); }, []);

  /* (dés)activation */
  const toggle = (m: IModule) =>
    updateModule({ ...m, enabled: !m.enabled }).then((saved) => {
      setMods((prev) => prev.map((x) => (x.id === saved.id ? saved : x)));
    });

  /* suppression définitive */
  const remove = async (id: string) => {
    if (!window.confirm('Supprimer ce module ? Cette action est irréversible.')) return;
    await fetch(`/api/modules/${id}`, { method: 'DELETE' });
    setMods((prev) => prev.filter((m) => m.id !== id));
  };

  /* ───── rendu ───── */
  return (
    <div className="admin-modules">
      <header className="mods-header">
        <div className="left">
          <button className="btn-back" onClick={() => navigate('/admin')}>
            ← Retour dashboard
          </button>
          <h1>Gestion des modules</h1>
        </div>

        <Link to={`${basePath}/modules/new`} className="btn-primary">
          + Nouveau
        </Link>
      </header>

      <ul className="cards">
        {mods.map((m) => (
          <li key={m.id} className={m.enabled ? '' : 'disabled'}>
            {/* entête */}
            <div className="card-head">
              <h2>{m.title || '(sans titre)'}</h2>

              <div className="head-actions">
                <button
                  className="toggle"
                  onClick={() => toggle(m)}
                  title="Activer / désactiver"
                >
                  {m.enabled ? '🟢' : '🔴'}
                </button>

                <button
                  className="btn-delete"
                  onClick={() => remove(m.id)}
                  title="Supprimer définitivement"
                >
                  🗑️
                </button>
              </div>
            </div>

            <p className="summary">{m.summary || '—'}</p>

            <footer>
              <Link to={`${basePath}/modules/${m.id}`} className="btn-secondary">
                ✏️ Éditer
              </Link>
            </footer>
          </li>
        ))}
      </ul>
    </div>
  );
}