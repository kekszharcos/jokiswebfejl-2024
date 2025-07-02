import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, doc, setDoc, updateDoc, deleteDoc, getDocs, QuerySnapshot, getDoc, DocumentSnapshot, DocumentData, arrayUnion, arrayRemove, onSnapshot } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class GroupService {
  collectionName = 'Groups';
  loggedInUserId: string;
  constructor(private auth:Auth, private firestore:Firestore) { this.loggedInUserId = this.auth.currentUser!.uid;}

  createGroup(name: string){
    const groupDoc = doc(this.firestore, this.collectionName);
    return setDoc(groupDoc,{owner: this.loggedInUserId, name: name, posts: []});
  }

  getGroupById(groupId: string) {
    return getDoc(doc(this.firestore, this.collectionName, groupId));
  }

  getGroups(){
    const groupsCollection = collection(this.firestore, this.collectionName);    
    return getDocs(groupsCollection);
  }

  updateGroup(groupId: string, name: string) {
    const groupDoc = doc(this.firestore, this.collectionName, groupId);
    return updateDoc(groupDoc, { name: name });
  }

  deleteGroup(groupId: string) {
    const groupDoc = doc(this.firestore, this.collectionName, groupId);
    return deleteDoc(groupDoc);
  }

  createPost(groupId: string, title:string, text:string){
    const groupDoc = doc(this.firestore, this.collectionName, groupId);
    return updateDoc(groupDoc, { posts: arrayUnion({title: title, text: text, postOwner: this.loggedInUserId}) });
  }

  getPostsByGroupId(groupId: string){
    const groupDoc = doc(this.firestore, this.collectionName, groupId);
    return getDoc(groupDoc).then((docSnapshot: DocumentSnapshot<DocumentData>) => {
      if (docSnapshot.exists()) {
        return docSnapshot.data()['posts'] || [];
      } else {
        throw new Error('Group not found');
      }
    });
  }

  updatePost(postId: string, title: string, text: string) {
    /*const groupDoc = doc(this.firestore, this.collectionName, postId);
    return updateDoc(groupDoc, { title: title, text: text });*/
  }

  deletePost(groupId: string, postId: string) {
    const groupDoc = doc(this.firestore, this.collectionName, groupId);
    return updateDoc(groupDoc, { posts: arrayRemove(postId) });
  }

  createComment(){
    
  }

  getCommentsByPostId(postId: string) {

  }

  deleteComment(commentId: string) {
  
  }

}
