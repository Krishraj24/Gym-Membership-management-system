import React, { useState, useEffect, useRef } from 'react';
import { Member, GymOwner } from '../types';
import { Plus, Users, Calendar, UserX, RotateCw, Search, Download, Trash2, Edit2, AlertCircle, QrCode, Camera, X as CloseIcon } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { formatDate } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

interface MemberActionsProps {
  ownerId: string;
  ownerData: GymOwner | null;
  isGuest?: boolean;
}

type ModalType = 'add' | 'current' | 'ending' | 'out' | 'renew' | null;

export default function MemberActions({ ownerId, ownerData, isGuest }: MemberActionsProps) {
  const { t } = useLanguage();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMembers = async () => {
    if (!ownerId) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'members'), where('ownerId', '==', ownerId));
      const snapshot = await getDocs(q);
      const fetchedMembers = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Member));
      setMembers(fetchedMembers);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeModal && activeModal !== 'add') {
      fetchMembers();
    }
  }, [activeModal]);

  const buttons = [
    { type: 'add' as ModalType, label: t('add_member'), icon: <Plus className="h-6 w-6" />, color: 'hover:text-accent hover:border-accent' },
    { type: 'current' as ModalType, label: t('active_members'), icon: <Users className="h-6 w-6" />, color: 'hover:text-accent hover:border-accent' },
    { type: 'ending' as ModalType, label: t('ending_membership'), icon: <Calendar className="h-6 w-6" />, color: 'hover:text-accent hover:border-accent' },
    { type: 'out' as ModalType, label: t('out_of_membership'), icon: <UserX className="h-6 w-6" />, color: 'hover:text-accent hover:border-accent' },
    { type: 'renew' as ModalType, label: t('quick_renew'), icon: <RotateCw className="h-6 w-6" />, color: 'hover:text-accent hover:border-accent' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        {buttons.map((btn) => (
          <button
            key={btn.type}
            onClick={() => setActiveModal(btn.type)}
            className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-card border border-border text-muted transition-all active:scale-95 group ${btn.color}`}
          >
            <div className="text-muted group-hover:text-accent transition-colors">
              {btn.icon}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-center">{btn.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-border flex justify-between items-center">
                <h3 className="text-sm font-bold text-accent uppercase tracking-widest">
                  {buttons.find(b => b.type === activeModal)?.label}
                </h3>
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="p-1 px-3 text-muted hover:text-ink text-sm font-bold border border-border rounded-lg"
                >
                  {t('back')}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <ModalContent 
                  type={activeModal} 
                  members={members} 
                  ownerId={ownerId} 
                  ownerData={ownerData}
                  onSuccess={() => { fetchMembers(); if (activeModal === 'add') setActiveModal(null); }}
                  isGuest={isGuest}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModalContent({ type, members, ownerId, ownerData, onSuccess, isGuest, searchTerm, setSearchTerm }: any) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<any>({
    name: '', age: '', phone: '', email: '', address: '',
    startDate: '', endDate: '', amountPaid: '', paymentMethod: 'cash', photoUrl: '',
    gender: 'male'
  });
  const [renewingMember, setRenewingMember] = useState<Member | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const compressed = await compressImage(file);
        setFormData((prev: any) => ({ ...prev, photoUrl: compressed }));
      } catch (err) {
        console.error("Compression failed", err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Filter members based on type
  const now = new Date();
  const currentMembers = members.filter((m: Member) => {
    const start = new Date(m.startDate instanceof Timestamp ? m.startDate.toDate() : m.startDate);
    const end = new Date(m.endDate instanceof Timestamp ? m.endDate.toDate() : m.endDate);
    return now >= start && now <= end && m.status === 'active';
  });

  const endingMembers = members.filter((m: Member) => {
    const end = new Date(m.endDate instanceof Timestamp ? m.endDate.toDate() : m.endDate);
    return end.toDateString() === now.toDateString() && m.status === 'active';
  });

  const outMembers = members.filter((m: Member) => {
    const end = new Date(m.endDate instanceof Timestamp ? m.endDate.toDate() : m.endDate);
    return (end < now || m.status === 'out') && end.toDateString() !== now.toDateString();
  });

  const renewList = [...endingMembers, ...outMembers];

  const filteredList = (list: Member[]) => {
    return list.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) return alert("Guest cannot add members");
    try {
      const memberData: Partial<Member> = {
        ...formData,
        ownerId,
        age: Number(formData.age),
        amountPaid: Number(formData.amountPaid),
        startDate: Timestamp.fromDate(new Date(formData.startDate)),
        endDate: Timestamp.fromDate(new Date(formData.endDate)),
        status: 'active',
        createdAt: Timestamp.now(),
      };
      await addDoc(collection(db, 'members'), memberData);
      onSuccess();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'members');
    }
  };

  const handleCancelMembership = async (id: string) => {
    if (isGuest) return;
    if (confirm("Do you want to cancel membership?")) {
      try {
        await updateDoc(doc(db, 'members', id), { status: 'out' });
        onSuccess();
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `members/${id}`);
      }
    }
  };

  const handleRemove = async (id: string) => {
    if (isGuest) return;
    if (confirm("Are you sure you want to remove this member completely?")) {
      try {
        await deleteDoc(doc(db, 'members', id));
        onSuccess();
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `members/${id}`);
      }
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(currentMembers.map((m: Member) => ({
      'Name': m.name,
      'Gender': m.gender,
      'Age': m.age,
      'Phone': m.phone,
      'Email': m.email || '',
      'Address': m.address || '',
      'Start Date': formatDate(m.startDate),
      'End Date': formatDate(m.endDate),
      'Amount Paid': m.amountPaid,
      'Payment Method': m.paymentMethod
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Active members');
    XLSX.writeFile(workbook, 'Active_Members_FiveStarFitness.xlsx');
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewingMember) return;
    try {
      await updateDoc(doc(db, 'members', renewingMember.id!), {
        startDate: Timestamp.fromDate(new Date(formData.startDate)),
        endDate: Timestamp.fromDate(new Date(formData.endDate)),
        amountPaid: Number(formData.amountPaid),
        paymentMethod: formData.paymentMethod,
        status: 'active'
      });
      alert(t('membership_renewed'));
      setRenewingMember(null);
      onSuccess();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `members/${renewingMember.id}`);
    }
  };

  if (type === 'add' || renewingMember) {
    const isRenew = !!renewingMember;
    return (
      <form onSubmit={isRenew ? handleRenewSubmit : handleAdd} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!isRenew && (
            <>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{t('member_photo')} ({t('optional')})</label>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-20 h-20 rounded-xl bg-bg border border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-accent group relative overflow-hidden"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {formData.photoUrl ? (
                      <img src={formData.photoUrl} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <>
                        <Camera className="h-5 w-5 text-muted group-hover:text-accent transition-colors" />
                        <span className="text-[8px] font-bold text-muted mt-1">{t('click_upload')}</span>
                      </>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-accent border-t-transparent animate-spin rounded-full" />
                      </div>
                    )}
                  </div>
                  {formData.photoUrl && (
                    <button 
                      type="button"
                      onClick={() => setFormData((prev: any) => ({ ...prev, photoUrl: '' }))}
                      className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline"
                    >
                      {t('remove_photo')}
                    </button>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{t('name')}</label>
                <input 
                  type="text" 
                  required 
                  className="w-full bg-bg border border-border text-ink rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-accent outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{t('age')}</label>
                <input 
                  type="number" 
                  required 
                  className="w-full bg-bg border border-border text-ink rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-accent outline-none"
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Whatsapp Number</label>
                <input 
                  type="text" 
                  required 
                  className="w-full bg-bg border border-border text-ink rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-accent outline-none"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Gender</label>
                <div className="flex items-center gap-4 py-2">
                  <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold uppercase tracking-widest text-muted">
                    <input 
                      type="radio" 
                      className="w-3 h-3 accent-accent"
                      checked={formData.gender === 'male'}
                      onChange={() => setFormData({...formData, gender: 'male'})}
                    />
                    Male
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold uppercase tracking-widest text-muted">
                    <input 
                      type="radio" 
                      className="w-3 h-3 accent-accent"
                      checked={formData.gender === 'female'}
                      onChange={() => setFormData({...formData, gender: 'female'})}
                    />
                    Female
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold uppercase tracking-widest text-muted">
                    <input 
                      type="radio" 
                      className="w-3 h-3 accent-accent"
                      checked={formData.gender === 'others'}
                      onChange={() => setFormData({...formData, gender: 'others'})}
                    />
                    Others
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{t('email')} ({t('optional')})</label>
                <input 
                  type="email" 
                  className="w-full bg-bg border border-border text-ink rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-accent outline-none"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{t('address')} ({t('optional')})</label>
                <textarea 
                  className="w-full bg-bg border border-border text-ink rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-accent outline-none"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  rows={2}
                />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{t('start_date')}</label>
            <input 
              type="date" 
              required 
              className="w-full bg-bg border border-border text-ink rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-accent outline-none [color-scheme:dark]"
              value={formData.startDate}
              onChange={e => setFormData({...formData, startDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{t('end_date')}</label>
            <input 
              type="date" 
              required 
              className="w-full bg-bg border border-border text-ink rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-accent outline-none [color-scheme:dark]"
              value={formData.endDate}
              onChange={e => setFormData({...formData, endDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{t('amount')}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">₹</span>
              <input 
                type="number" 
                required 
                className="w-full bg-bg border border-border text-ink rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-1 focus:ring-accent outline-none"
                value={formData.amountPaid}
                onChange={e => setFormData({...formData, amountPaid: e.target.value})}
              />
            </div>
          </div>
          <div className="flex items-center gap-8 md:pt-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-widest text-muted">
              <input 
                type="radio" 
                className="w-4 h-4 accent-accent"
                checked={formData.paymentMethod === 'cash'}
                onChange={() => setFormData({...formData, paymentMethod: 'cash'})}
              />
              Cash
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-widest text-muted">
              <input 
                type="radio" 
                className="w-4 h-4 accent-accent"
                checked={formData.paymentMethod === 'upi'}
                onChange={() => setFormData({...formData, paymentMethod: 'upi'})}
              />
              UPI
            </label>
          </div>

          {formData.paymentMethod === 'upi' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="md:col-span-2 bg-bg p-4 border border-border rounded-xl flex flex-col items-center"
            >
              <h4 className="text-[10px] font-bold text-accent uppercase tracking-widest mb-3 flex items-center gap-2">
                <QrCode className="h-3 w-3" /> Owner QR Code
              </h4>
              {ownerData?.qrPhotoUrl ? (
                <div className="bg-white p-2 rounded-lg mb-3">
                  <img src={ownerData.qrPhotoUrl} alt="Store QR" className="max-w-[120px] h-auto" />
                </div>
              ) : (
                <div className="text-amber-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-3 italic">
                  <AlertCircle className="h-3 w-3" /> QR Missing in Profile
                </div>
              )}
              <div className="w-full max-w-xs bg-card px-4 py-2 rounded-lg text-center font-mono text-[10px] text-muted border border-border">
                {ownerData?.upiId || "UPI ID not set"}
              </div>
            </motion.div>
          )}
        </div>
        
        <div className="flex justify-end pt-4 gap-3">
          {isRenew && (
            <button 
              type="button"
              onClick={() => setRenewingMember(null)}
              className="px-6 py-2 rounded-lg text-xs font-bold text-muted hover:text-ink transition-all"
            >
              {t('cancel').toUpperCase()}
            </button>
          )}
          <button 
            type="submit" 
            className="btn-primary py-2 px-8 text-xs"
          >
            {isRenew ? t('renew_membership_btn') : t('add_member').toUpperCase()}
          </button>
        </div>
      </form>
    );
  }

  const listToRender = 
    type === 'current' ? currentMembers :
    type === 'ending' ? endingMembers :
    type === 'out' ? outMembers :
    type === 'renew' ? renewList : [];

  const finalFilteredList = filteredList(listToRender);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input 
            type="text"
            className="w-full bg-bg border border-border text-ink rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-accent outline-none"
            placeholder={t('search_members')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        {type === 'current' && (
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-black rounded-lg text-xs font-bold hover:opacity-90 transition-all"
          >
            <Download className="h-4 w-4" /> {t('download_list')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {finalFilteredList.length > 0 ? finalFilteredList.map((m: Member) => (
          <div 
            key={m.id} 
            className="group relative bg-bg border border-border rounded-xl p-4 hover:border-accent transition-all cursor-pointer"
            onClick={() => type === 'current' && handleCancelMembership(m.id!)}
          >
            <div className="flex items-center gap-3">
              <img 
                src={m.photoUrl || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200'} 
                className="w-12 h-12 rounded-lg object-cover transition-all border border-border"
                alt={m.name}
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-ink text-sm truncate">{m.name}</h4>
                <p className="text-[10px] text-muted font-bold uppercase tracking-widest flex items-center gap-2">
                  {m.phone} 
                  <span className="w-1 h-1 bg-border rounded-full" />
                  <span className="text-accent">{m.gender}</span>
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span className={`text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded border ${m.status === 'active' ? 'border-emerald-500/50 text-emerald-500' : 'border-red-500/50 text-red-500'}`}>
                    {m.status}
                  </span>
                  <span className="text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded border border-accent/50 text-accent">
                    ₹{m.amountPaid}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-border flex justify-between items-center text-[9px] text-muted font-bold tracking-widest uppercase">
              <span>{formatDate(m.startDate)} - {formatDate(m.endDate)}</span>
              <div className="flex gap-1.5">
                {(type === 'out' || type === 'renew' || type === 'ending') && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setRenewingMember(m); }}
                    className="p-1 px-2 border border-border text-accent rounded hover:bg-card"
                  >
                    {t('renew')}
                  </button>
                )}
                {type === 'out' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRemove(m.id!); }}
                    className="p-1 px-2 border border-border text-red-500 rounded hover:bg-card"
                  >
                    {t('delete')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center text-[10px] text-muted font-bold uppercase tracking-[0.2em] italic">
            {t('no_members')}
          </div>
        )}
      </div>
    </div>
  );
}

function X(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="2" 
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
