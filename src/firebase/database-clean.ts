import { 
  ref,
  push,
  set,
  get,
  remove,
  query,
  orderByChild,
  equalTo,
  serverTimestamp,
  onValue,
  off
} from 'firebase/database'
import { database } from './config'

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
  createdAt: number | null
  updatedAt: number | null
}

/**
 * Create a new note
 */
export const createNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const notesRef = ref(database, 'notes')
    const newNoteRef = push(notesRef)
    
    const newNote = {
      ...note,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    await set(newNoteRef, newNote)
    return newNoteRef.key!
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
    const noteRef = ref(database, `notes/${noteId}`)
    const updatedData = {
      ...updates,
      updatedAt: serverTimestamp()
    }
    
    await set(noteRef, updatedData)
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
    const noteRef = ref(database, `notes/${noteId}`)
    await remove(noteRef)
  } catch (error) {
    console.error('Error deleting note:', error)
    throw error
  }
}

/**
 * Get a specific note by ID
 */
export const getNote = async (noteId: string): Promise<Note | null> => {
  try {
    const noteRef = ref(database, `notes/${noteId}`)
    const snapshot = await get(noteRef)
    
    if (snapshot.exists()) {
      return {
        id: noteId,
        ...snapshot.val()
      } as Note
    }
    
    return null
  } catch (error) {
    console.error('Error fetching note:', error)
    throw error
  }
}

/**
 * Get all notes for a specific user
 */
export const getUserNotes = async (userId: string): Promise<Note[]> => {
  try {
    const notesRef = ref(database, 'notes')
    const userNotesQuery = query(notesRef, orderByChild('userId'), equalTo(userId))
    const snapshot = await get(userNotesQuery)
    
    const notes: Note[] = []
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        notes.push({
          id: childSnapshot.key!,
          ...childSnapshot.val()
        } as Note)
      })
    }
    
    // Sort by updatedAt in descending order
    return notes.sort((a, b) => {
      if (!a.updatedAt || !b.updatedAt) return 0
      return b.updatedAt - a.updatedAt
    })
  } catch (error) {
    console.error('Error fetching user notes:', error)
    throw error
  }
}

/**
 * Listen to real-time updates for user notes
 */
export const listenToUserNotes = (
  userId: string, 
  callback: (notes: Note[]) => void
): (() => void) => {
  try {
    const notesRef = ref(database, 'notes')
    const userNotesQuery = query(notesRef, orderByChild('userId'), equalTo(userId))
    
    const unsubscribe = onValue(userNotesQuery, (snapshot) => {
      const notes: Note[] = []
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          notes.push({
            id: childSnapshot.key!,
            ...childSnapshot.val()
          } as Note)
        })
      }
      
      // Sort by updatedAt in descending order
      const sortedNotes = notes.sort((a, b) => {
        if (!a.updatedAt || !b.updatedAt) return 0
        return b.updatedAt - a.updatedAt
      })
      
      callback(sortedNotes)
    })
    
    return () => off(userNotesQuery, 'value', unsubscribe)
  } catch (error) {
    console.error('Error setting up notes listener:', error)
    throw error
  }
}

/**
 * Listen to real-time updates for a specific note
 */
export const listenToNote = (
  noteId: string, 
  callback: (note: Note | null) => void
): (() => void) => {
  try {
    const noteRef = ref(database, `notes/${noteId}`)
    
    const unsubscribe = onValue(noteRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({
          id: noteId,
          ...snapshot.val()
        } as Note)
      } else {
        callback(null)
      }
    })
    
    return () => off(noteRef, 'value', unsubscribe)
  } catch (error) {
    console.error('Error setting up note listener:', error)
    throw error
  }
}
