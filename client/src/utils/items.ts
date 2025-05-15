/* helpers communs pour manipuler l’arbre d’items
   ─────────────────────────────────────────────── */

   import { IItem } from '../api/modules';

   /** renvoie un tableau « à plat » de tous les items, enfants compris */
   export const flatten = (branch: IItem[]): IItem[] =>
     branch.flatMap(it => [it, ...flatten(it.children ?? [])]);

   /** renvoie la première « feuille » (item sans enfant) trouvée */
   export const firstLeaf = (branch: IItem[]): IItem | null => {
     for (const it of branch) {
       if (!it.children?.length) return it;
       const sub = firstLeaf(it.children);
       if (sub) return sub;
     }
     return null;
   };

   /** recherche récursive par id */
   export const findById = (branch: IItem[], id: string): IItem | null => {
     for (const it of branch) {
       if (it.id === id) return it;
       const sub = findById(it.children ?? [], id);
       if (sub) return sub;
     }
     return null;
   };