# Notes Web App – Requirements Document

## 1. Overview
A simple web application that allows users to create, view, edit, and delete personal notes. The app should be user-friendly and accessible from any modern web browser.

## 2. Features

### 2.1. User Stories
- As a user, I want to log in using Firebase authentication with Google.
- As a user, I want to create different notes.
- As a user, I want to view a list of all my available notes.
- As a user, I want to view a selected note with a key-value table structure.
- As a user, I want to add a row above or below the selected row in the table.
- As a user, I want to write text in table cells (both key and value columns).
- As a user, I want to edit and delete notes.

### 2.2. Functional Requirements
- Users can log in using Firebase authentication with Google sign-in only.
- Users can create different notes with unique identifiers.
- Users can see a list of all available notes documents.
- Users can select a note to view its details in a key-value table for  mat.
- Users can add new rows to the table above or below any selected row.
- Users can write and edit text directly in table cells (key and value columns).
- Users can delete notes.
- Notes are saved persistently using Firebase.
- The app should have a local caching mechanism that stores notes on the client and can refresh or synchronize data from the server when needed.

### 2.3. Pages Structure
1. **Login Page** - Firebase authentication login interface with Google sign-in only
2. **Notes Page** - Display all available notes documents with navigation options
3. **Note Page** - Display a selected note containing a two-column table (key-value style) with editing capabilities

### 2.3. Non-Functional Requirements
- The app should have a clean, responsive UI.
- The notes table should stretch to fill the full width of the window for better usability and visibility.
- The app should work on desktop and mobile browsers.
- Notes should be saved automatically or with a save button.
- The app should load quickly and be easy to use.


## 3. Technical Requirements
- Frontend: Vue.js framework with HTML and Tailwind CSS for styling
- Backend (optional): Node.js/Express with a simple REST API, or use browser local storage for persistence.
- Data storage: All notes are saved in a table of key and value pairs, where the key is a unique identifier and the value contains the note's data (title, content, etc.). Use Firebase as the primary backend storage solution for notes, enabling real-time synchronization and cloud persistence.

## 4. Development Tasks Breakdown

### 4.1. Project Setup
- [x] Initialize Vue.js project with Vite or Vue CLI
- [x] Install and configure Tailwind CSS
- [x] Set up Firebase project and configuration
- [x] Configure Firebase Authentication with Google provider
- [x] Set up Firebase Firestore database
- [x] Install necessary dependencies (Vue Router, Firebase SDK)

### 4.2. Authentication Implementation
- [x] Create login page component
- [x] Implement Google sign-in functionality
- [x] Set up authentication state management
- [x] Create route guards for protected pages
- [x] Implement logout functionality
- [x] Handle authentication errors and loading states

### 4.3. Database Structure
- [x] Design Firebase Realtime Database structure for notes
- [x] Create data models for notes (key-value pairs)
- [x] Set up Firebase Realtime Database security rules
- [x] Implement CRUD operations for notes

### 4.4. Notes List Page
- [ ] Create notes list component
- [ ] Implement fetching all user notes from Firebase
- [ ] Display notes with titles and creation dates
- [ ] Add "Create New Note" functionality
- [ ] Implement note deletion from list view
- [ ] Add loading and error states

### 4.5. Individual Note Page
- [ ] Create note detail component
- [ ] Implement key-value table display
- [ ] Add row insertion (above/below selected row)
- [ ] Implement inline cell editing for keys and values
- [ ] Add row deletion functionality
- [ ] Implement auto-save or manual save functionality
- [ ] Handle table stretching to full window width

### 4.6. Local Caching & Sync
- [ ] Implement local storage caching mechanism
- [ ] Add offline functionality for viewing cached notes
- [ ] Implement sync logic for when connection is restored
- [ ] Handle conflict resolution for simultaneous edits
- [ ] Add refresh/sync indicators in the UI

### 4.7. UI/UX Implementation
- [ ] Design responsive layout with Tailwind CSS
- [ ] Implement navigation between pages
- [ ] Add loading spinners and progress indicators
- [ ] Create error message components
- [ ] Ensure mobile-friendly design
- [ ] Add confirmation dialogs for destructive actions

### 4.8. Testing & Deployment
- [ ] Write unit tests for components
- [ ] Test authentication flow
- [ ] Test CRUD operations
- [ ] Test offline/online functionality
- [ ] Deploy to hosting platform (Firebase Hosting, Vercel, etc.)
- [ ] Configure production environment variables

## 5. Stretch Goals (Optional)
- User authentication (sign up, log in)
- Tagging or categorizing notes
- Search functionality
- Rich text editing
