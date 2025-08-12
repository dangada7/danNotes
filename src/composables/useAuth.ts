import { ref, onMounted, onUnmounted } from 'vue'
import { onAuthStateChange, signInWithGoogle, signOutUser, type AuthUser } from '../firebase'

export const useAuth = () => {
  const user = ref<AuthUser | null>(null)
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    // Listen for auth state changes
    unsubscribe = onAuthStateChange((authUser) => {
      user.value = authUser
      isLoading.value = false
    })
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  const signIn = async () => {
    try {
      error.value = null
      isLoading.value = true
      const authUser = await signInWithGoogle()
      user.value = authUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to sign in'
      console.error('Sign in error:', err)
    } finally {
      isLoading.value = false
    }
  }

  const signOut = async () => {
    try {
      error.value = null
      await signOutUser()
      user.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to sign out'
      console.error('Sign out error:', err)
    }
  }

  return {
    user,
    isLoading,
    error,
    signIn,
    signOut,
    isAuthenticated: () => user.value !== null
  }
}
