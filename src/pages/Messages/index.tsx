import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { fetchAvailableUsers } from '../../api/userApi'
import { fetchConversation, sendMessage, sendAttachment, Message } from '../../api/messageApi'
import { User } from '../../hooks/useAuth'
import { Send, Search, User as UserIcon, MessageSquare, Loader2, Paperclip } from 'lucide-react'

export default function MessagesPage() {
const { user: currentUser } = useAuth()
    const [users, setUsers] = useState<User[]>([])
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
     fetchAvailableUsers().then(setUsers).catch(console.error)
   }, [])

   useEffect(() => {
     if (!selectedUser) return

     const loadConversation = async () => {
       try {
         setIsLoading(true)
         const data = await fetchConversation(selectedUser.id)
         setMessages(data)
       } catch (err) {
         console.error("Erreur chargement messages", err)
       } finally {
         setIsLoading(false)
       }
     }

     loadConversation()
     const interval = setInterval(loadConversation, 5000)
     return () => clearInterval(interval)
   }, [selectedUser])

   useEffect(() => {
     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
   }, [messages])

const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!selectedUser || (!newMessage.trim() && !attachmentFile) || isSending) return

      try {
        setIsSending(true)
        if (attachmentFile) {
          await sendAttachment(selectedUser.id, newMessage, attachmentFile)
        } else {
          await sendMessage(selectedUser.id, newMessage)
        }
        const updatedMessages = await fetchConversation(selectedUser.id)
        setMessages(updatedMessages)
        setNewMessage('')
        setAttachmentFile(null)
        const fileInput = document.getElementById('attachment-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } catch (err) {
        console.error("Erreur envoi", err)
      } finally {
        setIsSending(false)
      }
    }

    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        setAttachmentFile(file)
      }
    }

  if (!currentUser) return null

   return (
     <div className="flex h-[calc(100-2rem)] gap-6 p-6">
       <div className="flex w-80 flex-col rounded-[2rem] bg-white shadow-soft dark:bg-slate-900">
         <div className="p-6">
           <h1 className="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">Messages</h1>
           <div className="relative">
             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
             <input
               type="text"
               placeholder="Rechercher..."
               className="w-full rounded-2xl border-none bg-slate-100 py-2 pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-sky-100 dark:bg-slate-800 dark:focus:ring-sky-900/30"
             />
           </div>
         </div>

         <div className="flex-1 overflow-y-auto px-3 pb-6">
           {users.map((u) => (
             <button
               key={u.id}
               onClick={() => setSelectedUser(u)}
               className={`group flex w-full items-center gap-3 rounded-2xl p-3 transition-colors ${
                 selectedUser?.id === u.id 
                   ? 'bg-sky-50 dark:bg-sky-500/10' 
                   : 'hover:bg-slate-50 dark:hover:bg-slate-800'
               }`}
             >
               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                 <UserIcon className="h-5 w-5" />
               </div>
               <div className="text-left">
                 <p className={`text-sm font-semibold ${selectedUser?.id === u.id ? 'text-sky-700 dark:text-sky-400' : 'text-slate-700 dark:text-slate-200'}`}>
                   {u.username}
                 </p>
                 <p className="text-xs text-slate-500 truncate w-32">{u.email}</p>
               </div>
             </button>
           ))}
         </div>
       </div>

       <div className="flex flex-1 flex-col rounded-[2rem] bg-white shadow-soft dark:bg-slate-900 overflow-hidden">
         {selectedUser ? (
           <>
             <div className="flex items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-500/15">
                 <UserIcon className="h-5 w-5" />
               </div>
               <div>
                 <p className="font-bold text-slate-900 dark:text-slate-100">{selectedUser.username}</p>
                 <p className="text-xs text-emerald-500 font-medium">En ligne</p>
               </div>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-4">
               {isLoading && messages.length === 0 ? (
                 <div className="flex h-full items-center justify-center">
                   <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                 </div>
               ) : (
                 messages.map((msg) => {
                   const isMe = msg.senderId === currentUser.id
                   return (
                     <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                         isMe 
                           ? 'bg-sky-600 text-white rounded-tr-none' 
                           : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-tl-none'
                       }`}>
                         <p>{msg.content}</p>
                         <p className={`mt-1 text-[10px] opacity-70 ${isMe ? 'text-right' : 'text-left'}`}>
                           {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </p>
                       </div>
                     </div>
                   )
                 })
               )}
               <div ref={messagesEndRef} />
             </div>

<form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-2xl p-2 px-4 focus-within:ring-2 focus-within:ring-sky-100 dark:focus-within:ring-sky-900/30">
                  <input
                    type="file"
                    id="attachment-input"
                    accept="image/*,audio/*"
                    onChange={handleAttachmentChange}
                    className="hidden"
                  />
                  <label htmlFor="attachment-input" className="cursor-pointer p-2 text-slate-400 hover:text-sky-600" title="Joindre un fichier">
                    <Paperclip className="h-5 w-5" />
                  </label>
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={attachmentFile ? "Ajouter un commentaire (optionnel)..." : "Écrivez votre message..."}
                    className="flex-1 bg-transparent border-none outline-none text-sm py-2 dark:text-slate-200"
                  />
                  {attachmentFile && (
                    <span className="text-xs text-sky-600 truncate max-w-24">{attachmentFile.name}</span>
                  )}
                  <button
                    type="submit"
                    disabled={!newMessage.trim() && !attachmentFile || isSending}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white transition hover:bg-sky-700 disabled:opacity-50"
                  >
                    {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </button>
                </div>
              </form>
           </>
         ) : (
           <div className="flex h-full flex-col items-center justify-center text-slate-400 space-y-4">
             <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800">
               <MessageSquare className="h-10 w-10" />
             </div>
             <p className="text-sm font-medium">Sélectionnez une conversation pour commencer</p>
           </div>
         )}
       </div>
     </div>
   )
}