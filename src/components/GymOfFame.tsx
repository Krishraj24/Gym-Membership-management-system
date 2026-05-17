import React, { useState, useEffect, useRef } from 'react';
import { FamePhoto } from '../types';
import { Camera, Plus, Trash2, Share2, Maximize2, Minimize2, Dumbbell, X, Trophy, Heart, Upload } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface GymOfFameProps {
  ownerId: string;
  isGuest?: boolean;
}

export default function GymOfFame({ ownerId, isGuest }: GymOfFameProps) {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState<FamePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchPhotos = async () => {
    if (!ownerId) return;
    try {
      const q = query(collection(db, 'fameGallery'), where('ownerId', '==', ownerId));
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as FamePhoto));
      setPhotos(fetched.sort((a, b) => {
        const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : a.createdAt;
        const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : b.createdAt;
        return dateB.getTime() - dateA.getTime();
      }));
      setCurrentIndex(0);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'fameGallery');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    if (Math.abs(info.offset.x) > 100) {
      if (info.offset.x > 0) {
        // Swiped right - previous
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
      } else {
        // Swiped left - next
        setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
      }
    }
  };

  const handleNext = () => setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  const handlePrev = () => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));

  useEffect(() => {
    fetchPhotos();
  }, [ownerId]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isGuest) return;

    setIsUploading(true);
    try {
      const compressed = await compressImage(file);
      await addDoc(collection(db, 'fameGallery'), {
        ownerId,
        photoUrl: compressed,
        createdAt: Timestamp.now()
      });
      fetchPhotos();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'fameGallery');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAdd = () => {
    if (isGuest) return alert("Guest cannot add photos");
    fileInputRef.current?.click();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGuest) return;
    if (confirm("Remove from Gym of Fame?")) {
      try {
        await deleteDoc(doc(db, 'fameGallery', id));
        fetchPhotos();
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `fameGallery/${id}`);
      }
    }
  };

  const handleShare = (photo: FamePhoto, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: 'Gym of Fame - Five Star Fitness',
        text: 'Check out this insane physique!',
        url: photo.photoUrl
      });
    } else {
      navigator.clipboard.writeText(photo.photoUrl);
      alert("Link copied to clipboard!");
    }
  };

  const handlePhotoInteraction = (url: string) => {
    if (zoomedPhoto === url) setZoomedPhoto(null);
    else setZoomedPhoto(url);
  };

  return (
    <section className="bento-card relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between section-header border-none mb-6">
        <div>
          <h2 className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-2">
            <Trophy className="h-3 w-3 text-accent" /> {t('gym_of_fame')}
          </h2>
          <p className="text-xl font-bold text-ink font-serif mt-1">{t('gym_of_fame')}</p>
        </div>
        {!isGuest && (
          <div className="flex items-center gap-3">
            {isUploading && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-accent animate-pulse">
                <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                {t('uploading')}...
              </div>
            )}
            <button 
              onClick={handleAdd}
              disabled={isUploading}
              className="flex items-center gap-1.5 px-3 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-bold border border-accent/20 hover:bg-accent/20 transition-all self-start md:self-center disabled:opacity-50"
            >
              <Plus className="h-3 w-3" /> {t('add_photo')}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload} 
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
        </div>
      ) : photos.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-bg/50">
          <Camera className="h-10 w-10 text-muted opacity-20 mb-4" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted italic">{t('no_fame_entries')}</p>
          {!isGuest && (
            <button 
              onClick={handleAdd}
              className="mt-6 flex items-center gap-2 px-6 py-2 border border-border text-ink rounded-lg text-xs font-bold hover:border-accent hover:text-accent transition-all"
            >
              <Plus className="h-4 w-4" /> {t('add_first_photo')}
            </button>
          )}
        </div>
      ) : (
        <div className="relative h-[450px] flex items-center justify-center perspective-1000 overflow-hidden">
          {/* Decorative Background Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 blur-[100px] rounded-full -z-10" />
          
          <div className="relative w-full max-w-[320px] h-[400px]">
            <AnimatePresence mode="popLayout">
              {photos.map((photo, index) => {
                const isStack = index >= currentIndex && index < currentIndex + 3;
                const stackIndex = index - currentIndex;
                
                if (!isStack) return null;

                return (
                  <motion.div
                    key={photo.id}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={handleDragEnd}
                    initial={{ scale: 0.8, y: 20, opacity: 0 }}
                    animate={{ 
                      scale: 1 - stackIndex * 0.05,
                      y: stackIndex * 15,
                      x: 0,
                      opacity: 1,
                      zIndex: photos.length - index,
                    }}
                    exit={{ x: 500, opacity: 0, scale: 0.5, rotate: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                    style={{ x: 0 }}
                  >
                    <div 
                      className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black group"
                      onClick={() => handlePhotoInteraction(photo.photoUrl)}
                    >
                      <img 
                        src={photo.photoUrl} 
                        alt="Physique" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                      />
                      
                      {/* Swipe Overlay Cues */}
                      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end">
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => handleShare(photo, e)}
                              className="p-2.5 bg-white/10 backdrop-blur-xl rounded-xl text-white hover:bg-accent/20 hover:text-accent transition-all"
                            >
                              <Share2 className="h-5 w-5" />
                            </button>
                            {!isGuest && (
                              <button 
                                onClick={(e) => handleDelete(photo.id!, e)}
                                className="p-2.5 bg-red-500/10 backdrop-blur-xl rounded-xl text-red-500 hover:bg-red-500/30 transition-all"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                   
                          <div className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">
                            {currentIndex + 1} / {photos.length}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {/* Navigation Indicators */}
            <div className="absolute -bottom-10 left-0 right-0 flex justify-center gap-6">
              <button 
                onClick={handlePrev}
                className="p-2 text-muted hover:text-accent transition-colors"
                aria-label="Previous photo"
              >
                <Maximize2 className="h-5 w-5 rotate-180" />
              </button>
              <div className="flex gap-1.5 items-center">
                {photos.slice(0, 10).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-4 bg-accent' : 'w-1 bg-border'}`} 
                  />
                ))}
              </div>
              <button 
                onClick={handleNext}
                className="p-2 text-muted hover:text-accent transition-colors"
                aria-label="Next photo"
              >
                <Maximize2 className="h-5 w-5" />
              </button>
            </div>
            
            {/* Swipe Instruction */}
            <div className="absolute -bottom-20 left-0 right-0 text-center animate-bounce">
              <p className="text-[9px] font-bold text-muted uppercase tracking-[0.3em]">{t('swipe_explore')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Zoom Portal */}
      <AnimatePresence>
        {zoomedPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedPhoto(null)}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
          >
            <button className="absolute top-8 right-8 text-white p-2">
              <X className="h-8 w-8" />
            </button>
            <motion.img 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={zoomedPhoto} 
              className="max-w-full max-h-full rounded-xl object-contain shadow-2xl"
              alt="Zoomed"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
