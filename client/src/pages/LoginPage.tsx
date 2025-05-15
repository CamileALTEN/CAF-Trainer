import React, { useState } from 'react';
import { useNavigate }      from 'react-router-dom';
import axios                from 'axios';
import { useAuth }          from '../context/AuthContext';
import './LoginPage.css';
import Footer from '../components/Footer';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  /* ───── connexion ───── */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const { ok, msg } = await login(username.trim(), password);
    setLoading(false);
    ok ? navigate('/', { replace:true }) : setError(msg || 'Erreur');
  };

  /* ───── mot de passe oublié ───── */
  const forgotPwd = async () => {
    const mail = prompt('Entrez votre identifiant (prenom.nom@alten.com) :')?.trim();
    if (!mail) return;
    try {
      await axios.post('/api/auth/forgot', { username: mail });
      alert('Votre demande a été transmise à l’équipe encadrante.');
    } catch (e: any) {
      alert(e.response?.data?.error || 'Erreur réseau');
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={submit}>
        <h2 className="login-title">CAF‑Trainer</h2>

        <div className="login-field">
          <label>Utilisateur</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="prenom.nom@alten.com"
            required
          />
        </div>

        <div className="login-field">
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="login-submit" disabled={loading}>
          {loading ? '…' : 'Se connecter'}
        </button>

        {error && <div className="login-error">{error}</div>}

        <div style={{ marginTop:'1rem' }}>
          <button
            type="button"
            style={{
              background:'none', border:'none', color:'#008bd2',
              cursor:'pointer', textDecoration:'underline', fontSize:'.85rem',
            }}
            onClick={forgotPwd}
          >
            Mot de passe oublié ?
          </button>
        </div>
      </form>

    </div>
  );
}