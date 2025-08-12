import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type Timestamp
} from 'firebase/firestore'
import { db } from './config'

export interface NoteRow {
  id: string
  key: string
  value: string
  order: number
}

export interface Note {
  id?: string
  title: string
  rows: NoteRow[]
  userId: string
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

const NOTES_COLLECTION = 'notes'

/**
 * Create a new note
 */
export const createNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, NOTES_COLLECTION), {
      ...note,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating note:', error)
    throw error
  }
}

/**
 * Update an existing note
 */
export const updateNote = async (noteId: string, updates: Partial<Note>): Promise<void> => {
  try {
    const noteRef = doc(db, NOTES_COLLECTION, noteId)
    await updateDoc(noteRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating note:', error)
    throw error
  }
}

/**
 * Delete a note
 */
export const deleteNote = async (noteId: string): Promise<void> => {
  try {
    const noteRef = doc(db, NOTES_COLLECTION, noteId)
    await deleteDoc(noteRef)
  } catch (error) {
    console.error('Error deleting note:', error)
    throw error
  }
}

/**
 * Get all notes for a specific user
 */
export const getUserNotes = async (userId: string): Promise<Note[]> => {
  try {
    const q = query(
      collection(db, NOTES_COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Note[]
  } catch (error) {
    console.error('Error getting user notes:', error)
    throw error
  }
}

/**
 * Get a specific note by ID
 */
export const getNote = async (noteId: string): Promise<Note | null> => {
  try {
    const noteRef = doc(db, NOTES_COLLECTION, noteId)
    const noteSnap = await getDoc(noteRef)
    
    if (noteSnap.exists()) {
      return {
        id: noteSnap.id,
        ...noteSnap.data()
      } as Note
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting note:', error)
    throw error
  }
}
