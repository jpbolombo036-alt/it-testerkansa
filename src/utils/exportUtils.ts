import { TestSession } from '../api/testSessionApi'

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
        <h1>${session.nom}</h1>
        <p><strong>Description:</strong> ${session.description || '-'}</p>
        <p><strong>Créé par:</strong> ${session.createdByUsername} (${session.createdByRole})</p>
        <p><strong>Environnement:</strong> ${session.environnement}</p>
        <p><strong>Version:</strong> ${session.version || '-'}</p>
        <p><strong>Nombre de tests:</strong> ${session.tests?.length || 0}</p>
      </div>
      
      <h2>Tests</h2>
      ${session.tests && session.tests.length > 0 ? `
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
          ${session.tests.map(test => `
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
      ` : '<p>Aucun test pour cette session</p>'}
      
      <script>window.onload = () => { window.print(); }</script>
    </body>
    </html>
  `
  
  printWindow.document.write(html)
  printWindow.document.close()
}

export const exportToWord = (session: TestSession) => {
  const content = `
Session de Test: ${session.nom}
================================

Description: ${session.description || '-'}
Créé par: ${session.createdByUsername} (${session.createdByRole})
Environnement: ${session.environnement}
Version: ${session.version || '-'}
Nombre de tests: ${session.tests?.length || 0}

Tests
-----
${session.tests && session.tests.length > 0 ? 
  session.tests.map((test, i) => `
${i + 1}. ${test.fonction}
   Précondition: ${test.precondition || '-'}
   Étapes: ${test.etapes}
   Résultat attendu: ${test.resultatAttendu}
   Résultat obtenu: ${test.resultatObtenu || '-'}
   Statut: ${test.statut}
   Commentaires: ${test.commentaires || '-'}
`).join('') : 'Aucun test pour cette session'}
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