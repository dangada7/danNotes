<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">Dan Notes</h1>
          </div>
          
          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <div v-if="user" class="flex items-center space-x-3">
              <img
                v-if="user.photoURL"
                :src="user.photoURL"
                :alt="user.displayName || 'User'"
                class="h-8 w-8 rounded-full"
              />
              <span class="text-sm font-medium text-gray-700">
                {{ user.displayName || user.email }}
              </span>
              <button
                @click="handleSignOut"
                class="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
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
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Header Actions -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Your Notes</h2>
          <button
            @click="createNewNote"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Note
          </button>
        </div>

        <!-- Empty State -->
        <div v-if="!notes || notes.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No notes yet</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by creating your first note.</p>
          <div class="mt-6">
            <button
              @click="createNewNote"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create your first note
            </button>
          </div>
        </div>

        <!-- Notes Grid -->
        <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="note in notes"
            :key="note.id"
            class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer"
            @click="note.id && openNote(note.id)"
          >
            <div class="p-6">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-gray-900 truncate">
                  {{ note.title || 'Untitled Note' }}
                </h3>
                <button
                  @click.stop="note.id && deleteNote(note.id)"
                  class="text-gray-400 hover:text-red-600 transition-colors duration-200"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <p class="mt-2 text-sm text-gray-600">
                {{ note.createdAt ? formatDate(new Date(note.createdAt)) : 'No date' }}
              </p>
              <p class="mt-2 text-sm text-gray-500">
                {{ note.rows.length || 0 }} {{ note.rows.length === 1 ? 'row' : 'rows' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watchEffect } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useNotes } from '../composables/useNotes'
import { useRouter } from 'vue-router'

const { user, signOut, isLoading: authLoading } = useAuth()
const router = useRouter()

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
  if (!notesComposable.value) return
  
  try {
    const noteId = await notesComposable.value.createNewNote('Untitled Note')
    router.push(`/note/${noteId}`)
  } catch (err) {
    console.error('Failed to create note:', err)
  }
}

const openNote = (noteId: string) => {
  router.push(`/note/${noteId}`)
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
