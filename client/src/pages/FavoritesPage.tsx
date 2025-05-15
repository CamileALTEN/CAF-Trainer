/* client/src/pages/FavoritesPage.tsx
   ────────────────────────────────── */
   import React, { useEffect, useState } from 'react';
   import { useNavigate }   from 'react-router-dom';
   import styled            from 'styled-components';
   import { useAuth }       from '../context/AuthContext';
   import { getModules, IItem, IModule } from '../api/modules';
   import { flatten }       from '../utils/items';


   export default function FavoritesPage() {
     const { user } = useAuth();
     const navigate = useNavigate();
     const favKey   = `favs_${user?.username}`;

     const [mods, setMods]   = useState<IModule[]>([]);
     const [favs, setFavs]   = useState<string[]>(() =>
       JSON.parse(localStorage.getItem(favKey) ?? '[]'),
     );
     const [loading, setLoading] = useState(true);

     useEffect(() => {
       getModules()
         .then(setMods)
         .finally(() => setLoading(false));
     }, []);

     if (loading) return <Wrapper><p>Chargement…</p></Wrapper>;

     /* construit une liste module → items favoris */
     const data = mods
       .map((m) => ({
         module: m,
         items:  flatten(m.items).filter((it) => favs.includes(it.id)),
       }))
       .filter((x) => x.items.length);

     return (
       <Wrapper>
         <header>
           <button onClick={() => navigate(-1)}>← Accueil</button>
           <h1>Mes favoris</h1>
         </header>

         {data.length === 0 ? (
           <p>Aucun favori enregistré.</p>
         ) : (
           data.map(({ module, items }) => (
             <section key={module.id} className="fav-module">
               <h2>{module.title}</h2>
               <ul>
                 {items.map((it) => (
                   <li key={it.id}>
                     <span>{it.title}</span>
                     <button
                       onClick={() =>
                         navigate(`/modules/${module.id}`, { state: { itemId: it.id } })
                       }
                     >
                       Ouvrir
                     </button>
                   </li>
                 ))}
               </ul>
             </section>
           ))
         )}
       </Wrapper>
     );
   }

   /* ---------------- styles ---------------- */
   const Wrapper = styled.div`     padding:2rem; max-width:960px; margin:auto;
     header{display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem}
     header h1{margin:0;font-size:1.8rem;color:#043962}
     header button{background:none;border:none;font-size:1.2rem;cursor:pointer;color:#008bd2}
     section{margin-bottom:2rem}
     h2{margin:.5rem 0 1rem;color:#008bd2}
     ul{list-style:none;padding:0;margin:0}
     li{display:flex;justify-content:space-between;align-items:center;padding:.5rem 0;border-bottom:1px solid #eee}
     li span{flex:1}
     li button{background:#008bd2;color:#fff;border:none;padding:.4rem .8rem;border-radius:4px;cursor:pointer}
     li button:hover{background:#006fa1}
  `;