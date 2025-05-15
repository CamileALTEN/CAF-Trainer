/* AdminDashboardPage – gestion complète des comptes
   ───────────────────────────────────────────────── */

   import React, { useEffect, useState } from 'react';
   import { Link } from 'react-router-dom';

   import { IUser } from '../api/auth';
   import { IModule } from '../api/modules';
   import './AdminDashboardPage.css';

   export default function AdminDashboardPage() {
     const [users, setUsers] = useState<IUser[]>([]);
     const [modules, setModules] = useState<IModule[]>([]);
     const [loading, setLoading] = useState(true);

     /* ───────── chargement initial ───────── */
     useEffect(() => {
       Promise.all([
         fetch('/api/users').then(r => r.json()),
         fetch('/api/modules').then(r => r.json()),
       ])
         .then(([u, m]) => {
           const mods: IModule[] =
             Array.isArray(m) ? m :
             m && typeof m === 'object' && Array.isArray((m as any).modules) ? (m as any).modules : [];
           setUsers(u);
           setModules(mods);
         })
         .finally(() => setLoading(false));
     }, []);

     /* ───────── helpers ───────── */
     const deleteUser = async (id: string) => {
       if (!window.confirm('Supprimer ce compte ?')) return;
       await fetch(`/api/users/${id}`, { method: 'DELETE' });
       setUsers(prev => prev.filter(u => u.id !== id));
     };

     const resetPwd = async (id: string) => {
       const pwd = prompt('Nouveau mot de passe :');
       if (!pwd) return;
       await fetch(`/api/users/${id}/password`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ password: pwd }),
       });
       alert('Mot de passe modifié');
     };

     const editUser = async (u: IUser) => {
       const username = prompt('Email (prenom.nom@alten.com) :', u.username) ?? u.username;
       if (!/^[a-z]+.[a-z][+@alten.com]$/i.test(username)) return alert('Email invalide');

       const role = prompt('Rôle (admin|manager|caf) :', u.role) ?? u.role;
       const site = role === 'caf'
         ? prompt('Site (Nantes|Montoir) :', u.site ?? '') ?? u.site
         : undefined;
       const managerId = role === 'caf'
         ? prompt('id manager (laisser vide si inchangé) :', u.managerId ?? '') || u.managerId
         : undefined;

       const res = await fetch(`/api/users/${u.id}`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ username, role, site, managerId }),
       });
       const data = await res.json();
       setUsers(prev => prev.map(x => (x.id === data.id ? data : x)));
     };

     /* ───────── rendu ───────── */
     if (loading) return <div className="admin-dashboard"><p>Chargement…</p></div>;

     // Tri des utilisateurs par rôle : admin → manager → caf
     const rolePriority: Record<string, number> = { admin: 0, manager: 1, caf: 2 };
     const sortedUsers = [...users].sort((a, b) => {
       const pa = rolePriority[a.role] ?? 3;
       const pb = rolePriority[b.role] ?? 3;
       if (pa !== pb) return pa - pb;
       return a.username.localeCompare(b.username);
     });

     const totalItems = modules.reduce((n, m) => n + (m.items?.length ?? 0), 0);

     return (
       <div className="admin-dashboard">
         <h1>Tableau de bord admin</h1>

         <section className="cards">
           <Stat label="Comptes" value={users.length} />
           <Stat label="Modules" value={modules.length} />
           <Stat label="Items" value={totalItems} />
         </section>

         <div className="quick">
           <Link to="/admin/create"><button>+ Créer un compte</button></Link>
           <Link to="/admin/modules"><button>📝 Modules</button></Link>
           <Link to="/admin/notifications"><button>🔔 Notifications</button></Link>
         </div>

         <h2>Comptes</h2>
         <table>
           <thead>
             <tr><th>User</th><th>Rôle</th><th>Site</th><th>Manager</th><th/></tr>
           </thead>
           <tbody>
             {sortedUsers.map(u => (
               <tr key={u.id}>
                 <td>{u.username}</td>
                 <td>{u.role}</td>
                 <td>{u.site ?? '—'}</td>
                 <td>{u.managerId ? users.find(m => m.id === u.managerId)?.username ?? u.managerId : '—'}</td>
                 <td style={{ whiteSpace: 'nowrap' }}>
                   <button onClick={() => editUser(u)} title="Modifier">✏️</button>{' '}
                   <button onClick={() => resetPwd(u.id)} title="Réinit. MDP">🔑</button>{' '}
                   {u.role === 'caf' && <button onClick={() => deleteUser(u.id)} title="Supprimer">🗑️</button>}
                   {u.role === 'manager' && <button onClick={() => deleteUser(u.id)} title="Supprimer">🗑️</button>}
                   {u.role === 'admin' && <button onClick={() => deleteUser(u.id)} title="Supprimer">🗑️</button>}
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
     );
   }

   const Stat = ({ label, value }: { label: string; value: number }) => (
     <div className="card">
       <h3>{label}</h3>
       <p className="big">{value}</p>
     </div>
   );