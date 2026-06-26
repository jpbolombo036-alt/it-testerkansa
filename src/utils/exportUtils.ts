import { TestSession } from '../api/testSessionApi'
import { Todo, UserWithTodos } from '../api/todoApi'

export const exportToPDF = (session: TestSession) => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Export PDF - ${session.nom}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #009966; }
        h2 { color: #1F2937; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
        th { background-color: #F5F6F8; font-weight: bold; }
        .header { margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="text-align: center;">${session.nom}</h1>
        <p><strong>Description:</strong> ${session.description || '-'}</p>
        <p><strong>Créé par:</strong> ${session.createdByUsername} (${session.createdByRole})</p>
        <p><strong>Rôle:</strong> ${session.role || '-'}</p>
        <p><strong>Environnement:</strong> ${session.environnement}</p>
        <p><strong>Version:</strong> ${session.version || '-'}</p>
        <p><strong>Date de création:</strong> ${new Date(session.dateCreation).toLocaleDateString('fr-FR')}</p>
        <p><strong>Nombre de tests:</strong> ${session.tests?.length || 0}</p>
      </div>
      
      <h2>Tests</h2>
      ${(() => {
        const allTests = session.tests || []
        const unresolved = allTests.filter(t => !t.resolved)
        const resolved = allTests.filter(t => t.resolved)
        if (allTests.length === 0) return '<p>Aucun test pour cette session</p>'
        if (unresolved.length === 0) return '<p>Tous les tests sont résolus.</p>'
        return `
        <table>
          <thead>
            <tr>
              <th>Fonction</th>
              <th>Précondition</th>
              <th>Étapes</th>
              <th>Résultat attendu</th>
              <th>Résultat obtenu</th>
              <th>Statut</th>
              <th>Commentaires</th>
            </tr>
          </thead>
          <tbody>
            ${unresolved.map(test => `
            <tr>
              <td>${test.fonction}</td>
              <td>${test.precondition || '-'}</td>
              <td>${test.etapes}</td>
              <td>${test.resultatAttendu}</td>
              <td>${test.resultatObtenu || '-'}</td>
              <td>${test.statut}</td>
              <td>${test.commentaires || '-'}</td>
            </tr>
          `).join('')}
          </tbody>
        </table>
        ${resolved.length > 0 ? `<p style="margin-top:12px; font-size:10px; color:#888;">Tests résolus (${resolved.length}) : ${resolved.map(t => t.fonction).join(', ')}</p>` : ''}
        `
      })()}
      
      <script>window.onload = () => { window.print(); }</script>
    </body>
    </html>
  `
  
  printWindow.document.write(html)
  printWindow.document.close()
}

export const exportToWord = (session: TestSession) => {
  const unresolved = (session.tests || []).filter(t => !t.resolved)
  const resolved = (session.tests || []).filter(t => t.resolved)
  const testsTable = unresolved.length > 0 ? `
  <table>
    <thead>
      <tr>
        <th>Fonction</th>
        <th>Précondition</th>
        <th>Étapes</th>
        <th>Résultat attendu</th>
        <th>Résultat obtenu</th>
        <th>Statut</th>
        <th>Commentaires</th>
      </tr>
    </thead>
    <tbody>
      ${unresolved.map(test => `
      <tr>
        <td>${test.fonction}</td>
        <td>${test.precondition || '-'}</td>
        <td>${test.etapes}</td>
        <td>${test.resultatAttendu}</td>
        <td>${test.resultatObtenu || '-'}</td>
        <td>${test.statut}</td>
        <td>${test.commentaires || '-'}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>` : '<p>Aucun test non résolu pour cette session</p>'

  const content = `
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; }
    h1 { color: #009966; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #999; padding: 6px; text-align: left; font-size: 11px; }
    th { background-color: #F5F6F8; font-weight: bold; }
    p { margin: 4px 0; }
  </style>
</head>
<body>
  <h1 style="text-align: center;">${session.nom}</h1>
  <p><strong>Description:</strong> ${session.description || '-'}</p>
  <p><strong>Créé par:</strong> ${session.createdByUsername} (${session.createdByRole})</p>
  <p><strong>Rôle:</strong> ${session.role || '-'}</p>
  <p><strong>Environnement:</strong> ${session.environnement}</p>
  <p><strong>Version:</strong> ${session.version || '-'}</p>
  <p><strong>Date de création:</strong> ${new Date(session.dateCreation).toLocaleDateString('fr-FR')}</p>
  <p><strong>Nombre de tests:</strong> ${session.tests?.length || 0} (${unresolved.length} non résolu${unresolved.length !== 1 ? 's' : ''})</p>
  <h2>Tests</h2>
  ${testsTable}
  ${resolved.length > 0 ? `<p style="margin-top:10px; font-size:10px; color:#888;">Tests résolus (${resolved.length}) : ${resolved.map(t => t.fonction).join(', ')}</p>` : ''}
</body>
</html>
  `

  const blob = new Blob([content], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `session-${session.nom}.doc`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const exportTodosToPDF = (todos: Todo[], username?: string) => {
  const enCoursTodos = todos.filter(todo => !todo.completed)
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Export PDF - Tâches ${username ? `de ${username}` : ''}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #009966; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
        th { background-color: #F5F6F8; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>Tâches ${username ? `de ${username}` : ''}</h1>
      ${enCoursTodos.length > 0 ? `
      <table>
        <thead>
          <tr>
            <th>Titre</th>
            <th>Description</th>
            <th>Priorité</th>
            <th>Échéance</th>
            <th>Statut</th>
            <th>Créateur</th>
          </tr>
        </thead>
        <tbody>
          ${enCoursTodos.map(todo => `
          <tr>
            <td>${todo.title}</td>
            <td>${todo.description || '-'}</td>
            <td>${todo.priority}</td>
            <td>${new Date(todo.dueDate).toLocaleDateString()}</td>
            <td>En cours</td>
            <td>${todo.createdByUsername || '-'}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
      ` : '<p>Aucune tâche en cours à exporter</p>'}
      
      <script>window.onload = () => { window.print(); }</script>
    </body>
    </html>
  `
  
  printWindow.document.write(html)
  printWindow.document.close()
}

export const exportTodosToWord = (todos: Todo[], username?: string) => {
  const enCoursTodos = todos.filter(todo => !todo.completed)
  const content = `
Tâches ${username ? `de ${username}` : ''}
===============================

${enCoursTodos.length > 0 ? 
  enCoursTodos.map((todo, i) => `
${i + 1}. ${todo.title}
   Description: ${todo.description || '-'}
   Priorité: ${todo.priority}
   Échéance: ${new Date(todo.dueDate).toLocaleDateString()}
   Statut: En cours
   Créateur: ${todo.createdByUsername || '-'}
`).join('') : 'Aucune tâche en cours à exporter'}
`

  const blob = new Blob([content], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `taches-${username || 'tous'}.doc`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}