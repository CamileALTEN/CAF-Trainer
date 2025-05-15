             /* ------------------------------------------------------------------ */
             /*  AdvancedEditor.tsx – version stabilisée                           */
             /* ------------------------------------------------------------------ */
             import React, { useRef, useState, useCallback, useMemo } from 'react';
             import ReactQuill from 'react-quill';
             import 'react-quill/dist/quill.snow\.css';
      
             import hljs from 'highlight.js';
             import 'highlight.js/styles/github.css';
      
             /* HLJS ---------------------------------------------------------------- */
             hljs.configure({
               languages: [
                 'javascript', 'typescript', 'python', 'go',
                 'java', 'c', 'cpp', 'json', 'bash', 'markdown'
               ]
             });
      
             /* -------------------------------------------------------------------- */
             export interface AdvancedEditorProps {
               value: string;
               onChange: (html: string) => void;
             }
      
             const AdvancedEditor: React.FC<AdvancedEditorProps> = ({ value, onChange }) => {
               /* 1. Ref Quill ----------------------------------------------------- */
               const quillRef = useRef<any>(null);
      
               /* 2. Compteur de mots --------------------------------------------- */
               const [words, setWords] = useState(0);
      
               /* 3. Handler image, MEMO‑ISÉ (sinon ↻ à chaque render) ------------ */
               const handleImage = useCallback(() => {
                 const input = document.createElement('input');
                 input.type = 'file';
                 input.accept = 'image/*';
                 input.click();
      
                 input.onchange = () => {
                   const file = input.files?.[0];
                   if (!file) return;
      
                   const reader = new FileReader();
                   reader.onload = () => {
                     const editor = quillRef.current?.getEditor();
                     const range  = editor?.getSelection(true);
                     editor?.insertEmbed(range?.index ?? 0, 'image', reader.result);
                   };
                   reader.readAsDataURL(file);
                 };
               }, []);                           // dépendances : aucune → stable
      
               /* 4. Modules / formats MEMO‑ISÉS ---------------------------------- */
               const modules = useMemo(
                 () => ({
                   syntax: { highlight: (txt: string) => hljs.highlightAuto(txt).value },
                   toolbar: {
                     container: [
                       [{ header: [1, 2, 3, false] }],
                       ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
                       [{ list: 'ordered' }, { list: 'bullet' }],
                       ['link', 'image'],
                       ['clean']
                     ],
                     handlers: { image: handleImage }
                   }
                 }),
                 [handleImage]                   // ne change plus car handleImage est figé
               );
      
               const formats = useMemo(
                 () => [
                   'header', 'bold', 'italic', 'underline', 'strike',
                   'blockquote', 'code-block',
                   'list', 'bullet',
                   'link', 'image'
                 ],
                 []
               );
      
               /* 5. onChange – MEMO‑ISÉ aussi (optionnel) ------------------------ */
               const onEditorChange = useCallback(
                 (html: string, _delta: any, _src: any, editor: any) => {
                   onChange(html);
                   const txt = editor.getText().trim();
                   setWords(txt ? txt.split(/s+/).length : 0);
                 },
                 [onChange]
               );
      
               /* 6. Rendu --------------------------------------------------------- */
               return (
                 <div className="advanced-editor">
                   <ReactQuill
                     ref={quillRef}
                     theme="snow"
                     value={value}
                     onChange={onEditorChange}
                     modules={modules}
                     formats={formats}
                     placeholder="Commencez à écrire…"
                   />
      
                   <div style={{ textAlign: 'right', fontSize: 12, marginTop: 4, color: '#666' }}>
                     {words} mot{words > 1 ? 's' : ''}
                   </div>
                 </div>
               );
             };
      
             export default AdvancedEditor;