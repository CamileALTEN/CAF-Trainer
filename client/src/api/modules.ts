// client/src/api/modules.ts
import axios from 'axios';
      
/* ═════════════════════════ TYPES PARTAGÉS ════════════════════════════ */
      
export interface ILink  {
  label: string;
  url:   string;
}
      
export interface IImage {
  src:   string;          // URL absolue ou relative
  width?: number;         // %  (10 – 100)
  align?: 'left' | 'center' | 'right';
}
      
export interface IItem  {
  id:        string;
  title:     string;
  subtitle?: string;
  content:   string;
      
  links:     ILink[];
  images:    IImage[];    // ← anciennement string[]
  videos:    string[];
  profiles:  string[];
  enabled:   boolean;
      
  children?: IItem[];
}
      
export interface IModule {
  id:       string;
  title:    string;
  summary:  string;
  enabled:  boolean;
  items:    IItem[];
}
export interface IProgress {
  username: string;          // CAF
  moduleId: string;
  visited:  string[];        // ids d’items complétés
}
      
      
/* ═════════════════════════ HELPERS DE NORMALISATION ══════════════════ */
      
function normaliseList(data: unknown): IModule[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'modules' in (data as any)) {
    return (data as any).modules ?? [];
  }
  return [];
}
      
function normaliseOne(id: string, data: unknown): IModule {
  if (data && typeof data === 'object' && 'items' in (data as any)) return data as IModule;
  if (data && typeof data === 'object' && 'modules' in (data as any)) {
    const f = (data as any).modules?.find((m: IModule) => m.id === id);
    if (f) return f;
  }
  throw new Error('Module introuvable');
}
      
/* ═════════════════════════ APPELS REST ═══════════════════════════════ */
      
export const getModules = async (): Promise<IModule[]> =>
  normaliseList((await axios.get('/api/modules')).data);
      
export const getModule  = async (id: string): Promise<IModule> =>
  normaliseOne(id, (await axios.get(`/api/modules/${id}`)).data);
      
export const updateModule = async (m: IModule): Promise<IModule> =>
  (await axios.put(`/api/modules/${m.id}`, m)).data;