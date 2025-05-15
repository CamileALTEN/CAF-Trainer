             /* client/src/components/FavoriteButton.tsx
                ──────────────────────────────────────── */
                import React from 'react';
      
                export interface FavoriteButtonProps {
                  isFav: boolean;
                  onClick: () => void;
                }
      
                /**
                 * Étoile “ajouter / retirer des favoris”.
                 * ⭐  = activé   ·   ☆ = désactivé (grisé)
                 */
                export default function FavoriteButton({ isFav, onClick }: FavoriteButtonProps) {
                  return (
                    <button
                      type="button"
                      onClick={onClick}
                      aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      style={{
                        background: 'none',
                        border:     'none',
                        cursor:     'pointer',
                        fontSize:   '1.6rem',
                        lineHeight: 1,
                        color:      isFav ? '#ffc107' : '#888',
                      }}
                    >
                      {isFav ? '⭐' : '☆'}
                    </button>
                  );
                }