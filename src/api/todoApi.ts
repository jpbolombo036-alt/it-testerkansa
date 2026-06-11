import api from './axios'

export interface Todo {
  id: number
  title: string
  description: string
  completed: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | string
  dueDate: string
  createdBy?: number
  createdByUsername?: string
}

export interface UserWithTodos {
  id: number
  username: string
  email: string
  role: string
  isActive: boolean
  todos: Todo[]
}

export type TodoCreateData = Omit<Todo, 'id'>

/**
 * GET /todos : Liste toutes les tâches
 */
export async function fetchTodos() {
  const response = await api.get<Todo[]>('/todos')
  return response.data
}

export async function fetchTodosGroupedByUser() {
  const response = await api.get<UserWithTodos[]>('/todos/grouped-by-user')
  return response.data
}

/**
 * POST /todos : Créer une nouvelle tâche
 */
export async function createTodo(data: TodoCreateData) {
  const response = await api.post<Todo>('/todos', data)
  return response.data
}

/**
 * PUT /todos/{id} : Mettre à jour une tâche
 */
export async function updateTodo(id: number, data: Partial<TodoCreateData>) {
  const response = await api.put<Todo>(`/todos/${id}`, data)
  return response.data
}

/**
 * DELETE /todos/{id} : Supprimer une tâche
 */
export async function deleteTodo(id: number) {
  await api.delete(`/todos/${id}`)
}

/**
 * PATCH /todos/{id}/toggle : Basculer l'état d'une tâche
 */
export async function toggleTodo(id: number) {
  const response = await api.patch<Todo>(`/todos/${id}/toggle`)
  return response.data
}