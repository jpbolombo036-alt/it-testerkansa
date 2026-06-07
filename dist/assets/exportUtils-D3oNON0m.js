var e=e=>{let t=window.open(``,`_blank`);if(!t)return;let n=`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Export PDF - ${e.nom}</title>
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
        <h1>${e.nom}</h1>
        <p><strong>Description:</strong> ${e.description||`-`}</p>
        <p><strong>Créé par:</strong> ${e.createdByUsername} (${e.createdByRole})</p>
        <p><strong>Environnement:</strong> ${e.environnement}</p>
        <p><strong>Version:</strong> ${e.version||`-`}</p>
        <p><strong>Nombre de tests:</strong> ${e.tests?.length||0}</p>
      </div>
      
      <h2>Tests</h2>
      ${e.tests&&e.tests.length>0?`
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
          ${e.tests.map(e=>`
          <tr>
            <td>${e.fonction}</td>
            <td>${e.precondition||`-`}</td>
            <td>${e.etapes}</td>
            <td>${e.resultatAttendu}</td>
            <td>${e.resultatObtenu||`-`}</td>
            <td>${e.statut}</td>
            <td>${e.commentaires||`-`}</td>
          </tr>
          `).join(``)}
        </tbody>
      </table>
      `:`<p>Aucun test pour cette session</p>`}
      
      <script>window.onload = () => { window.print(); }<\/script>
    </body>
    </html>
  `;t.document.write(n),t.document.close()},t=e=>{let t=`
Session de Test: ${e.nom}
================================

Description: ${e.description||`-`}
Créé par: ${e.createdByUsername} (${e.createdByRole})
Environnement: ${e.environnement}
Version: ${e.version||`-`}
Nombre de tests: ${e.tests?.length||0}

Tests
-----
${e.tests&&e.tests.length>0?e.tests.map((e,t)=>`
${t+1}. ${e.fonction}
   Précondition: ${e.precondition||`-`}
   Étapes: ${e.etapes}
   Résultat attendu: ${e.resultatAttendu}
   Résultat obtenu: ${e.resultatObtenu||`-`}
   Statut: ${e.statut}
   Commentaires: ${e.commentaires||`-`}
`).join(``):`Aucun test pour cette session`}
`,n=new Blob([t],{type:`application/msword`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`session-${e.nom}.doc`,document.body.appendChild(i),i.click(),document.body.removeChild(i),URL.revokeObjectURL(r)};export{e as exportToPDF,t as exportToWord};