             /* client/src/components/PageHeader.tsx
                ──────────────────────────────────── */
                import React from 'react';
                import { Link, useNavigate } from 'react-router-dom';
                import { useAuth }           from '../context/AuthContext';
                import './PageHeader.css';
      
                export default function PageHeader() {
                  const { user, logout } = useAuth();
                  const navigate = useNavigate();
      
                  const goHome = () => {
                    if (!user) return navigate('/login');
                    switch (user.role) {
                      case 'admin':   navigate('/admin');   break;
                      case 'manager': navigate('/manager'); break;
                      default:        navigate('/');        break;
                    }
                  };
      
                  return (
                    <header className="page-header">
                      <div className="header-left" onClick={goHome}>
                        <span className="header-title">CAF‑Trainer</span>
                      </div>
      
                      {user && (
                        <div className="header-right">
                          {(user.role === 'caf' || user.role === 'user') && (
                            <Link className="header-favs" to="/favoris">
                              ⭐ Favoris
                            </Link>
                          )}
      
                          <span className="header-user">{user.username}</span>
                          <button
                            className="header-logout"
                            onClick={() => { logout(); navigate('/logged-out'); }}
                          >
                            Se déconnecter
                          </button>
                        </div>
                      )}
                    </header>
                  );
                }