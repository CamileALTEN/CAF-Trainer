             import React from 'react';
             import { useNavigate, useLocation } from 'react-router-dom';
             import styled from 'styled-components';
             import { useAuth } from '../context/AuthContext';
      
             export default function ProfileSelector() {
               const nav = useNavigate();
               const loc = useLocation();
               const { logout } = useAuth();
      
               return (
                 <HeaderBar>
                   {loc.pathname !== '/login' && <button onClick={() => nav(-1)}>← Retour</button>}
                   <h1>CAF-Trainer</h1>
                   {loc.pathname !== '/login' && (
                     <button onClick={() => { logout(); nav('/logged-out'); }}>
                       Déconnexion
                     </button>
                   )}
                 </HeaderBar>
               );
             }
      
             const HeaderBar = styled.header`               display:flex; align-items:center; justify-content:space-between;
               padding:0.5rem 1rem; background:#043962; color:white;
               button { background:none; border:none; color:white; cursor:pointer; }
               h1 { margin:0; font-size:1.2rem; }
            `;