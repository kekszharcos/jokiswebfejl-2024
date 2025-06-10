import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, updateDoc, deleteDoc, query, where, collectionData, getDoc, DocumentSnapshot, DocumentData } from '@angular/fire/firestore';
import { Friend } from "../models/Friend";
import { from, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FriendService {}
