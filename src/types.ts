import { Timestamp } from 'firebase/firestore';

export interface GymOwner {
  id?: string;
  userId: string;
  gymName: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  photoUrl: string;
  qrPhotoUrl: string;
  upiId: string;
  createdAt: Timestamp | Date;
}

export interface Member {
  id?: string;
  ownerId: string;
  name: string;
  age: number;
  phone: string;
  email?: string;
  address?: string;
  photoUrl?: string;
  gender: 'male' | 'female' | 'others';
  startDate: Timestamp | Date;
  endDate: Timestamp | Date;
  amountPaid: number;
  paymentMethod: 'cash' | 'upi';
  status: 'active' | 'out';
  createdAt: Timestamp | Date;
}

export interface FamePhoto {
  id?: string;
  ownerId: string;
  photoUrl: string;
  description?: string;
  createdAt: Timestamp | Date;
}
