<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center space-x-3">
            <div class="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Dan Notes
            </h1>
          </div>
          
          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <div v-if="user" class="flex items-center space-x-4">
              <div class="flex items-center space-x-3 bg-white/50 rounded-full px-4 py-2 border border-gray-200/50">
                <img
                  v-if="user.photoURL"
                  :src="user.photoURL"
                  :alt="user.displayName || 'User'"
                  class="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
                <div v-else class="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <span class="text-sm font-semibold text-white">
                    {{ (user.displayName || user.email || 'U').charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div class="flex flex-col">
                  <span class="text-sm font-semibold text-gray-900">
                    {{ user.displayName || 'User' }}
                  </span>
                  <span class="text-xs text-gray-500">
                    {{ user.email }}
                  </span>
                </div>
              </div>
              <button
                @click="handleSignOut"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white/50 hover:bg-red-50 hover:text-red-700 rounded-lg border border-gray-200/50 transition-all duration-200 hover:shadow-md"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <div class="text-center">
          <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p class="text-gray-600 font-medium">Loading your notes...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 shadow-sm">
        <div class="flex">
          <div class="flex-shrink-0">
            <div class="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-semibold text-red-800">Something went wrong</h3>
            <p class="text-sm text-red-700 mt-1">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Header Actions -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Your Notes</h2>
            <p class="text-gray-600 mt-1">Organize your thoughts and ideas</p>
          </div>
          <button
            @click="showCreateModal = true"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Note
          </button>
        </div>

        <!-- Empty State -->
        <div v-if="!notes || notes.length === 0" class="text-center py-20">
          <div class="max-w-md mx-auto">
            <div class="h-24 w-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">No notes yet</h3>
            <p class="text-gray-600 mb-8">Get started by creating your first note and begin organizing your thoughts.</p>
            <button
              @click="showCreateModal = true"
              class="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create your first note
            </button>
          </div>
        </div>

        <!-- Notes Grid -->
        <div v-else class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div
            v-for="note in notes"
            :key="note.id"
            class="group bg-white/80 backdrop-blur-sm overflow-hidden shadow-md rounded-2xl border border-gray-200/50 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:border-blue-300/50"
            @click="note.id && openNote(note.id)"
          >
            <div class="p-6">
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-200">
                    {{ note.title || 'Untitled Note' }}
                  </h3>
                  <div class="flex items-center space-x-4 mt-3">
                    <div class="flex items-center text-sm text-gray-500">
                      <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ note.createdAt ? formatDate(new Date(note.createdAt)) : 'No date' }}
                    </div>
                  </div>
                  <div class="flex items-center justify-between mt-4">
                    <div class="flex items-center text-sm text-gray-500">
                      <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {{ note.rows.length || 0 }} {{ note.rows.length === 1 ? 'row' : 'rows' }}
                    </div>
                    <button
                      @click.stop="note.id && deleteNote(note.id)"
                      class="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Delete note"
                    >
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Create Note Modal -->
    <div 
      v-if="showCreateModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="showCreateModal = false"
    >
      <div 
        class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        @click.stop
      >
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-gray-900">Create New Note</h3>
          <button
            @click="showCreateModal = false"
            class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="createNewNote">
          <div class="mb-6">
            <label for="noteTitle" class="block text-sm font-medium text-gray-700 mb-2">
              Note Title
            </label>
            <input
              id="noteTitle"
              v-model="newNoteTitle"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Enter a title for your note..."
              required
              maxlength="100"
            />
            <p class="mt-2 text-sm text-gray-500">
              {{ newNoteTitle.length }}/100 characters
            </p>
          </div>
          
          <div class="flex space-x-3">
            <button
              type="button"
              @click="showCreateModal = false"
              class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="!newNoteTitle.trim() || isCreating"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span v-if="isCreating">Creating...</span>
              <span v-else>Create Note</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watchEffect } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useNotes } from '../composables/useNotes'
import { useRouter } from 'vue-router'

const { user, signOut, isLoading: authLoading } = useAuth()
const router = useRouter()

// Modal state
const showCreateModal = ref(false)
const newNoteTitle = ref('')
const isCreating = ref(false)

// Redirect to login if not authenticated
watchEffect(() => {
  if (!authLoading.value && !user.value) {
    router.push('/login')
  }
})

const notesComposable = computed(() => {
  return user.value ? useNotes(user.value.uid) : null
})

const notes = computed(() => notesComposable.value?.sortedNotes.value || [])
const isLoading = computed(() => notesComposable.value?.isLoading.value || false)
const error = computed(() => notesComposable.value?.error.value || null)

onMounted(() => {
  if (notesComposable.value) {
    notesComposable.value.loadNotes()
  }
})

const handleSignOut = async () => {
  await signOut()
  router.push('/login')
}

const createNewNote = async () => {
  if (!notesComposable.value || !newNoteTitle.value.trim()) return
  
  try {
    isCreating.value = true
    const noteId = await notesComposable.value.createNewNote(newNoteTitle.value.trim())
    
    // Reset modal state
    showCreateModal.value = false
    newNoteTitle.value = ''
    
    // For now, just refresh the notes list instead of navigating
    await notesComposable.value.loadNotes()
  } catch (err) {
    console.error('Failed to create note:', err)
  } finally {
    isCreating.value = false
  }
}

const openNote = (noteId: string) => {
  // For now, just log that we're opening a note
  console.log('Opening note:', noteId)
  // In the future, this would navigate to a note editing page
}

const deleteNote = async (noteId: string) => {
  if (!notesComposable.value) return
  
  if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
    try {
      await notesComposable.value.deleteNoteById(noteId)
    } catch (err) {
      console.error('Failed to delete note:', err)
    }
  }
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>
