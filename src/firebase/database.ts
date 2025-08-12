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
  off,
  update
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
 * Create a new note (notebook) under user
 */
export const createNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    // Create the notebook under notebooks/${userId}
    const notebooksRef = ref(database, `notebooks/${note.userId}`)
    const newNotebookRef = push(notebooksRef)
    
    const newNotebook = {
      title: note.title,
      userId: note.userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    await set(newNotebookRef, newNotebook)
    const notebookId = newNotebookRef.key!
    
    // Create the initial note rows under notes/${userId}/${notebookId}
    if (note.rows && note.rows.length > 0) {
      const notesRef = ref(database, `notes/${note.userId}/${notebookId}`)
      const noteRowsData: { [key: string]: any } = {}
      
      note.rows.forEach(row => {
        noteRowsData[row.id] = {
          key: row.key,
          value: row.value,
          order: row.order,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      })
      
      await update(notesRef, noteRowsData)
    }
    
    return notebookId
  } catch (error) {
    console.error('Error creating note:', error)
    throw error
  }
}

/**
 * Update an existing note (notebook)
 */
export const updateNote = async (noteId: string, updates: Partial<Note>): Promise<void> => {
  try {
    if (!updates.userId) {
      throw new Error('User ID is required for updating note')
    }
    
    // Update the notebook
    const notebookRef = ref(database, `notebooks/${updates.userId}/${noteId}`)
    const notebookUpdates: any = {
      updatedAt: serverTimestamp()
    }
    
    if (updates.title !== undefined) {
      notebookUpdates.title = updates.title
    }
    
    await update(notebookRef, notebookUpdates)
    
    // Update the note rows if provided
    if (updates.rows) {
      const notesRef = ref(database, `notes/${updates.userId}/${noteId}`)
      const noteRowsData: { [key: string]: any } = {}
      
      updates.rows.forEach(row => {
        noteRowsData[row.id] = {
          key: row.key,
          value: row.value,
          order: row.order,
          updatedAt: serverTimestamp()
        }
      })
      
      await update(notesRef, noteRowsData)
    }
  } catch (error) {
    console.error('Error updating note:', error)
    throw error
  }
}

/**
 * Delete a note (notebook and all its rows)
 */
export const deleteNote = async (noteId: string, userId: string): Promise<void> => {
  try {
    // Delete the notebook
    const notebookRef = ref(database, `notebooks/${userId}/${noteId}`)
    await remove(notebookRef)
    
    // Delete all note rows
    const notesRef = ref(database, `notes/${userId}/${noteId}`)
    await remove(notesRef)
  } catch (error) {
    console.error('Error deleting note:', error)
    throw error
  }
}

/**
 * Get a specific note by ID
 */
export const getNote = async (noteId: string, userId: string): Promise<Note | null> => {
  try {
    // Get the notebook data
    const notebookRef = ref(database, `notebooks/${userId}/${noteId}`)
    const notebookSnapshot = await get(notebookRef)
    
    if (!notebookSnapshot.exists()) {
      return null
    }
    
    const notebookData = notebookSnapshot.val()
    
    // Get the note rows
    const notesRef = ref(database, `notes/${userId}/${noteId}`)
    const notesSnapshot = await get(notesRef)
    
    const rows: NoteRow[] = []
    if (notesSnapshot.exists()) {
      notesSnapshot.forEach((childSnapshot) => {
        rows.push({
          id: childSnapshot.key!,
          ...childSnapshot.val()
        } as NoteRow)
      })
    }
    
    // Sort rows by order
    rows.sort((a, b) => a.order - b.order)
    
    return {
      id: noteId,
      title: notebookData.title,
      rows,
      userId: notebookData.userId,
      createdAt: notebookData.createdAt,
      updatedAt: notebookData.updatedAt
    } as Note
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
    const notebooksRef = ref(database, `notebooks/${userId}`)
    const snapshot = await get(notebooksRef)
    
    const notes: Note[] = []
    
    if (snapshot.exists()) {
      // Get all notebooks for the user
      const notebooks = snapshot.val()
      
      // For each notebook, get its rows
      for (const [notebookId, notebookData] of Object.entries(notebooks)) {
        const notesRef = ref(database, `notes/${userId}/${notebookId}`)
        const notesSnapshot = await get(notesRef)
        
        const rows: NoteRow[] = []
        if (notesSnapshot.exists()) {
          notesSnapshot.forEach((childSnapshot) => {
            rows.push({
              id: childSnapshot.key!,
              ...childSnapshot.val()
            } as NoteRow)
          })
        }
        
        // Sort rows by order
        rows.sort((a, b) => a.order - b.order)
        
        notes.push({
          id: notebookId,
          ...(notebookData as any),
          rows
        } as Note)
      }
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
    const notebooksRef = ref(database, `notebooks/${userId}`)
    
    const unsubscribe = onValue(notebooksRef, async (snapshot) => {
      const notes: Note[] = []
      
      if (snapshot.exists()) {
        const notebooks = snapshot.val()
        
        // For each notebook, get its rows
        for (const [notebookId, notebookData] of Object.entries(notebooks)) {
          const notesRef = ref(database, `notes/${userId}/${notebookId}`)
          const notesSnapshot = await get(notesRef)
          
          const rows: NoteRow[] = []
          if (notesSnapshot.exists()) {
            notesSnapshot.forEach((childSnapshot) => {
              rows.push({
                id: childSnapshot.key!,
                ...childSnapshot.val()
              } as NoteRow)
            })
          }
          
          // Sort rows by order
          rows.sort((a, b) => a.order - b.order)
          
          notes.push({
            id: notebookId,
            ...(notebookData as any),
            rows
          } as Note)
        }
      }
      
      // Sort by updatedAt in descending order
      const sortedNotes = notes.sort((a, b) => {
        if (!a.updatedAt || !b.updatedAt) return 0
        return b.updatedAt - a.updatedAt
      })
      
      callback(sortedNotes)
    })
    
    return () => off(notebooksRef, 'value', unsubscribe)
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
  userId: string,
  callback: (note: Note | null) => void
): (() => void) => {
  try {
    const notebookRef = ref(database, `notebooks/${userId}/${noteId}`)
    const notesRef = ref(database, `notes/${userId}/${noteId}`)
    
    let notebookData: any = null
    let noteRows: NoteRow[] = []
    
    const updateCallback = () => {
      if (notebookData) {
        callback({
          id: noteId,
          title: notebookData.title,
          rows: noteRows,
          userId: notebookData.userId,
          createdAt: notebookData.createdAt,
          updatedAt: notebookData.updatedAt
        } as Note)
      } else {
        callback(null)
      }
    }
    
    const notebookUnsubscribe = onValue(notebookRef, (snapshot) => {
      if (snapshot.exists()) {
        notebookData = snapshot.val()
      } else {
        notebookData = null
      }
      updateCallback()
    })
    
    const notesUnsubscribe = onValue(notesRef, (snapshot) => {
      noteRows = []
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          noteRows.push({
            id: childSnapshot.key!,
            ...childSnapshot.val()
          } as NoteRow)
        })
      }
      // Sort rows by order
      noteRows.sort((a, b) => a.order - b.order)
      updateCallback()
    })
    
    return () => {
      off(notebookRef, 'value', notebookUnsubscribe)
      off(notesRef, 'value', notesUnsubscribe)
    }
  } catch (error) {
    console.error('Error setting up note listener:', error)
    throw error
  }
}
