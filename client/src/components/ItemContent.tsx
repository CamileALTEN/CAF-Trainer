             /* client/src/components/ItemContent.tsx
                ───────────────────────────────────── */
      
                import React from 'react';
                import FavoriteButton from './FavoriteButton';
                import './ItemContent.css';
                import { IImage, ILink } from '../api/modules';
      
                export interface ItemContentProps {
                  /* ─── contenu ─── */
                  title:       string;
                  description: string;
                  links?:      ILink[];
                  images?:     (string | IImage)[];
                  videos?:     string[];
      
                  /* ─── progression ─── */
                  isVisited:        boolean;
                  onToggleVisited:  () => void;
      
                  /* ─── favoris ─── */
                  isFav:       boolean;
                  onToggleFav: () => void;
                }
      
                /* ════════════════════════════════════════════════════════════════════ */
      
                export default function ItemContent(props: ItemContentProps) {
                  const {
                    title, description, links = [], images, videos,
                    isVisited, onToggleVisited,
                    isFav,     onToggleFav,
                  } = props;
      
                  return (
                    <div className="item-content">
                      {/* -------- entête -------- */}
                      <div className="item-header">
                        <div className="item-titles">
                          <h1>{title}</h1>
                        </div>
      
                        <div className="item-actions">
                          {/* coche “vu” */}
                          <button
                            type="button"
                            className="check-button"
                            onClick={onToggleVisited}
                            aria-label={isVisited ? 'Marquer non visité' : 'Marquer visité'}
                          >
                            {isVisited ? '✅' : '⭕'}
                          </button>
      
                          {/* étoile favoris */}
                          <FavoriteButton isFav={isFav} onClick={onToggleFav} />
                        </div>
                      </div>
      
                      {/* -------- corps HTML (éditeur) -------- */}
                      <div
                        className="item-body"
                        dangerouslySetInnerHTML={{ __html: description }}
                      />
      
                      {/* -------- liens -------- */}
                      {links.length > 0 && (
                        <div className="item-links">
                          <h3>Liens</h3>
                          <ul>
                            {links.map((l, i) => (
                              <li key={i} className="item-link">
                                <span>{l.label || l.url}</span>{' '}
                                —{' '}
                                <a href={l.url} target="_blank" rel="noopener noreferrer">
                                  {l.url}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
      
                      {/* -------- images -------- */}
                      {images?.length ? (
                        <div className="item-images">
                          {images.map((im, i) => {
                            const img  = typeof im === 'string' ? { src: im } : im;
                            const w    = img.width ?? 100;
                            const al   = img.align ?? 'left';
                            const style: React.CSSProperties = {
                              width:       `${w}%`,
                              maxWidth:    '100%',
                              display:     'block',
                              marginLeft:  al === 'center' ? 'auto' : al === 'right' ? 'auto' : 0,
                              marginRight: al === 'center' ? 'auto' : al === 'left'  ? 'auto' : 0,
                            };
                            return <img key={i} src={img.src} style={style} alt="" />;
                          })}
                        </div>
                      ) : null}
      
                      {/* -------- vidéos -------- */}
                      {videos?.length ? (
                        <div className="item-videos">
                          {videos.map((url, i) => (
                            <video key={i} controls src={url} />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                }