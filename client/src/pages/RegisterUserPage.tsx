//  \client\src\pages\RegisterUserPage.tsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Loader from '../components/Loader';
import { Role, IUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function RegisterUserPage() {
  const { user } = useAuth();                     // admin ou manager

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role,     setRole]     = useState<Role>('caf');
  const [site,     setSite]     = useState('Nantes');

  const [managers, setManagers] = useState<IUser[]>([]);
  const [managerId, setManagerId] = useState<string>('');

  const [msg,      setMsg]      = useState('');
  const [loading,  setLoading]  = useState(false);

  /* ───────── chargement managers pour l’admin ───────── */
  useEffect(() => {
    if (user?.role !== 'admin') return;
    fetch('/api/users')
      .then(r => r.json())
      .then((list: IUser[]) => setManagers(list.filter(u => u.role === 'manager')));
  }, [user]);

  /* ───────── constantes d’affichage ───────── */
  const mailRx = /^[a-z0-9]+(\.[a-z0-9]+)?@alten\.com$/i;

  const allowed:Role[] = user?.role === 'admin'
    ? ['caf','manager','admin'] : ['caf'];

  /* ───────── soumission ───────── */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg('');

    if (!mailRx.test(username))
      return setMsg('❌ Le nom doit être de la forme prenom.nom@alten.com');
    if (role === 'caf' && !managerId && user?.role === 'admin')
      return setMsg('❌ Sélectionnez un manager pour le CAF');

    setLoading(true);
    try {
      const body = {
        username,
        password,
        role,
        site: role === 'caf' ? site : undefined,
        managerId: role === 'caf'
          ? (user?.role === 'manager' ? user.id : managerId)
          : undefined,
      };

      const res = await fetch('/api/users', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setMsg(`✅ Compte créé : ${data.username}`);
      setUsername(''); setPassword(''); setManagerId('');
    } catch (err:any) {
      setMsg(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      {loading && <Loader />}
      <h2>Créer un compte</h2>

      <Form onSubmit={submit}>
        <label>Rôle
          <select value={role} onChange={e=>setRole(e.target.value as Role)}>
            {allowed.map(r=><option key={r}>{r}</option>)}
          </select>
        </label>

        {role === 'caf' && (
          <>
            <label>Site
              <select value={site} onChange={e=>setSite(e.target.value)}>
                <option>Nantes</option>
                <option>Montoir</option>
              </select>
            </label>

            {/* sélection manager : visible seulement pour l’admin */}
            {user?.role === 'admin' && (
              <label>Manager
                <select
                  value={managerId}
                  onChange={e=>setManagerId(e.target.value)}
                  required
                >
                  <option value="">— choisir —</option>
                  {managers.map(m=>(
                    <option key={m.id} value={m.id}>{m.username}</option>
                  ))}
                </select>
              </label>
            )}
          </>
        )}

        <label>Utilisateur (mail Alten)
          <input
            value={username}
            onChange={e=>setUsername(e.target.value)}
            placeholder="prenom.nom@alten.com"
            required
          />
        </label>

        <label>Mot de passe
          <input
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? '…' : 'Créer'}
        </button>
        {msg && <p>{msg}</p>}
      </Form>
    </Wrapper>
  );
}

/* ───────── styles ───────── */
const Wrapper = styled.div`  padding:2rem; max-width:360px; margin:auto;
      `;
const Form    = styled.form`  display:flex; flex-direction:column; gap:.75rem;
  input,select{padding:.5rem; border:1px solid #bbb; border-radius:4px;}
  button{padding:.6rem; background:#008bd2; color:#fff; border:none; border-radius:4px;}
  button:hover:not(:disabled){background:#006fa1;}
      `;