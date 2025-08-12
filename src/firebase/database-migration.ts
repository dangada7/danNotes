import { ref, get, set, remove } from 'firebase/database'
import { database } from './config'

/**
 * Migration utility to move existing notes from old structure to new structure
 * Old: notes/{noteId}
 * New: notebooks/{userId}/{notebookId} + notes/{userId}/{notebookId}/{noteId}
 */
export const migrateToNewStructure = async () => {
  try {
    console.log('Starting migration to new database structure...')
    
    // Get all existing notes from the old structure
    const oldNotesRef = ref(database, 'notes')
    const snapshot = await get(oldNotesRef)
    
    if (!snapshot.exists()) {
      console.log('No existing notes found to migrate.')
      return
    }
    
    const oldNotes = snapshot.val()
    const migratedNotes: any[] = []
    
    // Process each note
    for (const [noteId, noteData] of Object.entries(oldNotes) as any[]) {
      if (noteData.userId) {
        console.log(`Migrating note ${noteId} for user ${noteData.userId}`)
        
        // Create notebook entry
        const notebookRef = ref(database, `notebooks/${noteData.userId}/${noteId}`)
        await set(notebookRef, {
          title: noteData.title || 'Untitled Note',
          userId: noteData.userId,
          createdAt: noteData.createdAt || Date.now(),
          updatedAt: noteData.updatedAt || Date.now()
        })
        
        // Migrate note rows if they exist
        if (noteData.rows && Array.isArray(noteData.rows)) {
          const noteRowsRef = ref(database, `notes/${noteData.userId}/${noteId}`)
          const rowsData: any = {}
          
          noteData.rows.forEach((row: any, index: number) => {
            const rowId = row.id || `row_${index}`
            rowsData[rowId] = {
              key: row.key || '',
              value: row.value || '',
              order: row.order !== undefined ? row.order : index,
              createdAt: Date.now(),
              updatedAt: Date.now()
            }
          })
          
          await set(noteRowsRef, rowsData)
        }
        
        migratedNotes.push({ noteId, userId: noteData.userId })
      }
    }
    
    console.log(`Successfully migrated ${migratedNotes.length} notes.`)
    console.log('Migration complete! You can now safely remove the old notes structure if needed.')
    
    return migratedNotes
  } catch (error) {
    console.error('Error during migration:', error)
    throw error
  }
}

/**
 * Clean up the old notes structure (use with caution!)
 */
export const cleanupOldStructure = async () => {
  try {
    console.log('WARNING: This will permanently delete the old notes structure.')
    console.log('Make sure the migration was successful before running this.')
    
    const oldNotesRef = ref(database, 'notes')
    await remove(oldNotesRef)
    
    console.log('Old notes structure removed.')
  } catch (error) {
    console.error('Error cleaning up old structure:', error)
    throw error
  }
}
