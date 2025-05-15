import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

export default function LoggedOutPage() {
  const navigate = useNavigate();
  return (
    <Wrapper>
      <p>Vous êtes déconnecté.</p>
      <button onClick={() => navigate('/login')}>Se reconnecter</button>
    </Wrapper>
  );
}

const Wrapper = styled.div`  height:100vh;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  background:#f5f5f5;
  button {
    padding:0.5rem 1rem;
    margin-top:1rem;
    background:#008BD2;
    color:white;
    border:none;
    border-radius:4px;
    cursor:pointer;
    &:hover { background:#006fa1; }
  }
      `;