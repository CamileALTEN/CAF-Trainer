             /* ✨ stub minimal – suffisant pour le ref & les méthodes d’instance */
      
             declare module 'react-quill' {
               import * as React from 'react';
               import { Quill } from 'quill';
      
               // ­—— props principales (gardez‑les concises) ——
               export interface ReactQuillProps {
                 value?: string;
                 defaultValue?: string;
                 onChange?: (
                   content: string,
                   delta: unknown,
                   source: 'user' | 'api',
                   editor: Quill
                 ) => void;
                 modules?: Record<string, unknown>;
                 formats?: string[];
                 theme?: string;
                 placeholder?: string;
                 className?: string;
                 style?: React.CSSProperties;
               }
      
               /** La classe est à la fois la valeur *et* le type de l’instance */
               export default class ReactQuill extends React.Component<ReactQuillProps> {
                 focus(): void;
                 blur(): void;
                 getEditor(): Quill;
               }
             }