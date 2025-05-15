/* client/src/pages/ManagerDashboardPage.tsx
   ────────────────────────────────────────── */
   import React, { useEffect, useState } from 'react';
   import { useAuth }   from '../context/AuthContext';
   import styled        from 'styled-components';
   import { IUser }     from '../api/auth';
   import { IProgress } from '../api/modules';
   import { Link }      from 'react-router-dom';
   import { Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart } from 'recharts';

   export default function ManagerDashboardPage() {
     const { user } = useAuth();               // rôle == manager
     const [caf,setCaf]         = useState<IUser[]>([]);
     const [prog,setProg]       = useState<IProgress[]>([]);
     const [loading,setLoading] = useState(true);

     useEffect(()=>{
       Promise.all([
         fetch(`/api/users?managerId=${user!.id}`).then(r=>r.json()),
         fetch(`/api/progress?managerId=${user!.id}`).then(r=>r.json()),
       ]).then(([u,p])=>{ setCaf(u); setProg(p); })
         .finally(()=>setLoading(false));
     },[user]);

     /* regroupe par utilisateur */
     const data = caf.map(c => {
       const rows = prog.filter(r=>r.username===c.username);
       const totalVisited = rows.reduce((n,r)=>n+r.visited.length,0);
       return { name:c.username, visited:totalVisited };
     });

     if(loading) return <p style={{padding:'2rem'}}>Chargement…</p>;

     return (
       <Wrapper>
         <h1>Dashboard manager</h1>

         <section className="cards">
           <StatCard label="CAF gérés" value={caf.length}/>
           <StatCard label="Modules suivis" value={prog.length}/>
         </section>

         {/* ----------- actions rapides ----------- */}
         <div className="quick">
           <Link to="/manager/create"><button className="btn">+ Créer un compte CAF</button></Link>
           <Link to="/manager/modules"><button className="btn">📝 Modules</button></Link>
         </div>

         <h2>Progression globale (Items)</h2>
         <ResponsiveContainer width="100%" height={240}>
           <BarChart data={data}>
             <XAxis dataKey="name"/><YAxis allowDecimals={false}/>
             <Tooltip/>
             <Bar dataKey="visited"/>
           </BarChart>
         </ResponsiveContainer>

         <h2>Changer un mot de passe</h2>
         <table>
           <thead><tr><th>Utilisateur</th><th>Site</th><th>Réinit. MDP</th></tr></thead>
           <tbody>
             {caf.map(c=>(
               <tr key={c.id}>
                 <td>{c.username}</td><td>{c.site}</td>
                 <td>
                   <button onClick={()=>resetPwd(c.id)}>🔑</button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </Wrapper>
     );

     async function resetPwd(id:string){
       const pwd = prompt('Nouveau mot de passe :');
       if(!pwd) return;
       await fetch(`/api/users/${id}/password`,{
         method:'PATCH',
         headers:{'Content-Type':'application/json'},
         body:JSON.stringify({password:pwd}),
       });
       alert('Mot de passe modifié');
     }
   }

   const StatCard = ({label,value}:{label:string;value:number})=>(
     <div className="card"><h3>{label}</h3><p className="big">{value}</p></div>
   );

   const Wrapper = styled.div`     padding:1.5rem; max-width:960px; margin:auto;
     .cards{display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:1.5rem}
     .card{flex:1 1 180px;background:#f9f9f9;padding:1rem;border-radius:8px;
           text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.1)}
     .big{font-size:2rem;font-weight:bold;color:#008BD2;margin-top:.5rem}
   
     /* ---- actions rapides ---- */
     .quick{display:flex;gap:1rem;margin-bottom:1rem;flex-wrap:wrap}
     .btn{background:#008bd2;color:#fff;border:none;padding:.6rem 1rem;border-radius:4px}
     .btn:hover{background:#006fa1}
   
     table{width:100%;border-collapse:collapse;margin-top:1rem}
     th,td{border-bottom:1px solid #e0e0e0;padding:.5rem .75rem}
  `;