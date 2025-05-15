/* client/src/pages/PrerequisPage.tsx
   ────────────────────────────────── */
   import React, { useEffect, useState } from 'react';
   import SidebarMenu    from '../components/SidebarMenu';
   import ItemContent    from '../components/ItemContent';
   import ProgressBar    from '../components/ProgressBar';
   import { flatten, findById } from '../utils/items';
   import { getModule, IItem, IModule } from '../api/modules';
   import { useAuth }     from '../context/AuthContext';
   import './PrerequisPage.css';

   export default function PrerequisPage() {
     const MODULE_ID = 'prerequis';
     const { user }  = useAuth();
     const favKey    = `favs_${user?.username}`;

     const [mod, setMod]            = useState<IModule | null>(null);
     const [selectedId, setSelId ]  = useState<string>('');
     const [visitedIds, setVisited] = useState<string[]>(
       () => JSON.parse(localStorage.getItem(`visited_${MODULE_ID}`) ?? '[]'),
     );
     const [favs, setFavs] = useState<string[]>(
       () => JSON.parse(localStorage.getItem(favKey) ?? '[]'),
     );

     /* ---------- chargement module ---------- */
     useEffect(() => {
       getModule(MODULE_ID).then((m) => {
         setMod(m);
         setSelId(m.items[0]?.id ?? '');
       });
     }, []);

     /* ---------- helpers ---------- */
     const toggleVisited = (id: string) =>
       setVisited((prev) => {
         const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
         localStorage.setItem(`visited_${MODULE_ID}`, JSON.stringify(next));
         return next;
       });

     const toggleFav = (id: string) =>
       setFavs((prev) => {
         const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
         localStorage.setItem(favKey, JSON.stringify(next));
         return next;
       });

     /* ---------- rendu ---------- */
     if (!mod) return <p>Chargement…</p>;
     const item = findById(mod.items, selectedId);

     return (
       <div className="prerequis-page">
         <SidebarMenu
           items={mod.items}
           selected={selectedId}
           onSelect={setSelId}
           visited={visitedIds}
         />

         <main className="content-area">
           <ProgressBar
             current={visitedIds.length}
             total={flatten(mod.items).length}
           />

           {item && (
             <ItemContent
               title={item.title}
               images={item.images}
               description={item.content}
               links={item.links}

               videos={item.videos}
               isVisited={visitedIds.includes(item.id)}
               onToggleVisited={() => toggleVisited(item.id)}
               isFav={favs.includes(item.id)}
               onToggleFav={() => toggleFav(item.id)}
             />
           )}
         </main>
       </div>
     );
   }