             import React from 'react';
             import styled from 'styled-components';
      
             export default function Loader() {
               return (
                 <Wrapper>
                   <div className="loader">
                     <div className="jimu-primary-loading" />
                   </div>
                 </Wrapper>
               );
             }
      
             const Wrapper = styled.div`               .loader {
                 position: fixed; top:0; bottom:0; left:0; right:0;
                 background: rgba(255,255,255,0.6);
               }
               .jimu-primary-loading,
               .jimu-primary-loading:before,
               .jimu-primary-loading:after {
                 background: #076fe5;
                 width: 13.6px; height: 32px;
                 animation: loading-keys 0.8s infinite ease-in-out;
                 position: absolute; top: calc(50% - 16px);
               }
               .jimu-primary-loading { left: calc(50% - 6.8px); animation-delay: 0.16s; }
               .jimu-primary-loading:before { content: ''; left: -19.992px; }
               .jimu-primary-loading:after  { content: ''; left: 19.992px; animation-delay: 0.32s; }
             
               @keyframes loading-keys {
                 0%,80%,100% { opacity:.75; box-shadow:0 0 #076fe5; height:32px; }
                 40%         { opacity:1;   box-shadow:0 -8px #076fe5; height:40px; }
               }
            `;