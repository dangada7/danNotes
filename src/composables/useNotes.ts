import { ref, computed } from 'vue'
import { 
  createNote, 
  updateNote, 
  deleteNote, 
  getUserNotes, 
  getNote,
  type Note,
  type NoteRow 
} from '../firebase'

export const useNotes = (userId: string) => {
  const notes = ref<Note[]>([])
  const currentNote = ref<Note | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const sortedNotes = computed(() => {
    return [...notes.value].sort((a, b) => {
      if (!a.updatedAt || !b.updatedAt) return 0
      return b.updatedAt - a.updatedAt
    })
  })

  const loadNotes = async () => {
    try {
      isLoading.value = true
      error.value = null
      notes.value = await getUserNotes(userId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load notes'
      console.error('Load notes error:', err)
    } finally {
      isLoading.value = false
    }
  }

  const loadNote = async (noteId: string) => {
    try {
      isLoading.value = true
      error.value = null
      currentNote.value = await getNote(noteId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load note'
      console.error('Load note error:', err)
    } finally {
      isLoading.value = false
    }
  }

  const createNewNote = async (title: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const newNote = {
        title,
        rows: [
          {
            id: crypto.randomUUID(),
            key: '',
            value: '',
            order: 0
          }
        ] as NoteRow[],
        userId
      }
      
      const noteId = await createNote(newNote)
      await loadNotes() // Refresh the list
      return noteId
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create note'
      console.error('Create note error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateCurrentNote = async (updates: Partial<Note>) => {
    if (!currentNote.value?.id) return
    
    try {
      error.value = null
      await updateNote(currentNote.value.id, updates)
      
      // Update local state
      if (currentNote.value) {
        Object.assign(currentNote.value, updates)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update note'
      console.error('Update note error:', err)
      throw err
    }
  }

  const deleteNoteById = async (noteId: string) => {
    try {
      isLoading.value = true
      error.value = null
      await deleteNote(noteId)
      notes.value = notes.value.filter(note => note.id !== noteId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete note'
      console.error('Delete note error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    notes,
    currentNote,
    sortedNotes,
    isLoading,
    error,
    loadNotes,
    loadNote,
    createNewNote,
    updateCurrentNote,
    deleteNoteById
  }
}
