import React, { useState, useRef } from 'react';
import { GymOwner } from '../types';
import { Camera, Edit2, Check, X, Phone, Mail, MapPin, Upload, QrCode } from 'lucide-react';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { useLanguage } from '../context/LanguageContext';

interface OwnerProfileSectionProps {
  ownerData: GymOwner | null;
  setOwnerData: (data: GymOwner) => void;
  userId: string;
  isGuest?: boolean;
}

export default function OwnerProfileSection({ ownerData, setOwnerData, userId, isGuest }: OwnerProfileSectionProps) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(!ownerData && !isGuest);
  const [formData, setFormData] = useState<Partial<GymOwner>>(ownerData || {
    gymName: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    photoUrl: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=200',
    qrPhotoUrl: '',
    upiId: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'photoUrl' | 'qrPhotoUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const compressed = await compressImage(file);
        setFormData(prev => ({ ...prev, [field]: compressed }));
      } catch (err) {
        console.error("Compression failed", err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (isGuest) return;
    try {
      const newOwnerData = {
        ...formData,
        userId,
        createdAt: ownerData?.createdAt || Timestamp.now(),
      } as GymOwner;
      
      await setDoc(doc(db, 'owners', userId), newOwnerData);
      setOwnerData(newOwnerData);
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `owners/${userId}`);
    }
  };

  return (
    <section className="bento-card">
      <div className="section-header">{t('owner_profile')}</div>
      <div className="flex flex-col gap-6 items-center text-center">
        <div className="relative group">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-dashed border-muted flex items-center justify-center bg-bg relative">
            <img 
              src={formData.photoUrl || 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=200'} 
              className="w-full h-full object-cover"
              alt="Owner"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-accent border-t-transparent animate-spin rounded-full" />
              </div>
            )}
          </div>
          {isEditing && !isGuest && (
            <>
              <button 
                className="absolute bottom-0 right-0 bg-accent text-black p-2 rounded-full shadow-lg hover:opacity-90 transition-all scale-75 md:scale-100"
                onClick={() => profileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </button>
              <input 
                type="file" 
                ref={profileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handlePhotoUpload(e, 'photoUrl')} 
              />
            </>
          )}
        </div>

        <div className="w-full">
          {isEditing && !isGuest ? (
            <div className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{t('gym_name')}</label>
                <input 
                  className="w-full bg-bg border-border text-ink rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-accent outline-none"
                  value={formData.gymName}
                  onChange={(e) => setFormData({ ...formData, gymName: e.target.value })}
                  placeholder="Your Gym Name"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{t('name')}</label>
                  <input 
                    className="w-full bg-bg border-border text-ink rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-accent outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{t('phone')}</label>
                  <input 
                    className="w-full bg-bg border-border text-ink rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-accent outline-none"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Email</label>
                  <input 
                    className="w-full bg-bg border-border text-ink rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-accent outline-none"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1">UPI ID</label>
                  <input 
                    className="w-full bg-bg border-border text-ink rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-accent outline-none"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{t('address')}</label>
                <textarea 
                  className="w-full bg-bg border-border text-ink rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-accent outline-none"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1">QR Photo</label>
                <div className="flex items-center gap-4 mt-1">
                  <div 
                    className="w-12 h-12 rounded-lg bg-bg border border-dashed border-border flex items-center justify-center cursor-pointer hover:border-accent overflow-hidden relative"
                    onClick={() => qrInputRef.current?.click()}
                  >
                    {formData.qrPhotoUrl ? (
                      <img src={formData.qrPhotoUrl} className="w-full h-full object-cover" alt="QR Preview" />
                    ) : (
                      <QrCode className="h-4 w-4 text-muted" />
                    )}
                  </div>
                  <button 
                    type="button"
                    onClick={() => qrInputRef.current?.click()}
                    className="text-[10px] font-bold text-accent uppercase tracking-widest flex items-center gap-1.5"
                  >
                    <Upload className="h-3 w-3" /> {t('uploading')} QR
                  </button>
                  <input 
                    type="file" 
                    ref={qrInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => handlePhotoUpload(e, 'qrPhotoUrl')} 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-bold text-muted hover:text-ink px-4"
                >
                  {t('cancel')}
                </button>
                <button 
                  onClick={handleSave}
                  className="btn-primary py-1.5 px-4 text-xs"
                >
                  {t('save_profile')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-black text-accent font-serif tracking-tight">{ownerData?.gymName || "GYM NAME"}</h1>
                <p className="text-xs font-bold text-muted uppercase tracking-widest mt-1">Managed By {ownerData?.name || "Member Name"}</p>
              </div>
              <div className="space-y-2 text-xs font-medium text-ink/80 pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                   <Phone className="h-3 w-3 text-accent" />
                   <span>{ownerData?.phone || "+91 00000 00000"}</span>
                </div>
                <div className="flex items-center gap-2">
                   <Mail className="h-3 w-3 text-accent" />
                   <span className="truncate block max-w-full">{ownerData?.email || "owner@gym.com"}</span>
                </div>
                <div className="flex items-start gap-2 text-left">
                   <MapPin className="h-3 w-3 text-accent mt-0.5 shrink-0" />
                   <span>{ownerData?.address || "Gym Address Details"}</span>
                </div>
              </div>
              {!isGuest && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-2 border border-border rounded-lg text-[10px] font-bold text-muted hover:border-accent hover:text-accent transition-all"
                >
                  <Edit2 className="h-3 w-3" /> {t('edit_profile')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
