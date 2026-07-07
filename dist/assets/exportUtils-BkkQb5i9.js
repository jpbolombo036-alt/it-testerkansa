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
        <h1 style="text-align: center;">${e.nom}</h1>
        <p><strong>Description:</strong> ${e.description||`-`}</p>
        <p><strong>Créé par:</strong> ${e.createdByUsername} (${e.createdByRole})</p>
        <p><strong>Rôle:</strong> ${e.role||`-`}</p>
        <p><strong>Environnement:</strong> ${e.environnement}</p>
        <p><strong>Version:</strong> ${e.version||`-`}</p>
        <p><strong>Date de création:</strong> ${new Date(e.dateCreation).toLocaleDateString(`fr-FR`)}</p>
        <p><strong>Nombre de tests:</strong> ${e.tests?.length||0}</p>
      </div>
      
      <h2>Tests</h2>
      ${(()=>{let t=e.tests||[],n=t.filter(e=>!e.resolved),r=t.filter(e=>e.resolved);return t.length===0?`<p>Aucun test pour cette session</p>`:n.length===0?`<p>Tous les tests sont résolus.</p>`:`
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
            ${n.map(e=>`
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
        ${r.length>0?`<p style="margin-top:12px; font-size:10px; color:#888;">Tests résolus (${r.length}) : ${r.map(e=>e.fonction).join(`, `)}</p>`:``}
        `})()}
      
      <script>window.onload = () => { window.print(); }<\/script>
    </body>
    </html>
  `;t.document.write(n),t.document.close()},t=e=>{let t=(e.tests||[]).filter(e=>!e.resolved),n=(e.tests||[]).filter(e=>e.resolved),r=t.length>0?`
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
      ${t.map(e=>`
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
  </table>`:`<p>Aucun test non résolu pour cette session</p>`,i=`
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
  <h1 style="text-align: center;">${e.nom}</h1>
  <p><strong>Description:</strong> ${e.description||`-`}</p>
  <p><strong>Créé par:</strong> ${e.createdByUsername} (${e.createdByRole})</p>
  <p><strong>Rôle:</strong> ${e.role||`-`}</p>
  <p><strong>Environnement:</strong> ${e.environnement}</p>
  <p><strong>Version:</strong> ${e.version||`-`}</p>
  <p><strong>Date de création:</strong> ${new Date(e.dateCreation).toLocaleDateString(`fr-FR`)}</p>
  <p><strong>Nombre de tests:</strong> ${e.tests?.length||0} (${t.length} non résolu${t.length===1?``:`s`})</p>
  <h2>Tests</h2>
  ${r}
  ${n.length>0?`<p style="margin-top:10px; font-size:10px; color:#888;">Tests résolus (${n.length}) : ${n.map(e=>e.fonction).join(`, `)}</p>`:``}
</body>
</html>
  `,a=new Blob([i],{type:`application/msword`}),o=URL.createObjectURL(a),s=document.createElement(`a`);s.href=o,s.download=`session-${e.nom}.doc`,document.body.appendChild(s),s.click(),document.body.removeChild(s),URL.revokeObjectURL(o)},n=(e,t)=>{let n=e.filter(e=>!e.completed),r=window.open(``,`_blank`);if(!r)return;let i=`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Export PDF - Tâches ${t?`de ${t}`:``}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #009966; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
        th { background-color: #F5F6F8; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>Tâches ${t?`de ${t}`:``}</h1>
      ${n.length>0?`
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
          ${n.map(e=>`
          <tr>
            <td>${e.title}</td>
            <td>${e.description||`-`}</td>
            <td>${e.priority}</td>
            <td>${new Date(e.dueDate).toLocaleDateString()}</td>
            <td>En cours</td>
            <td>${e.createdByUsername||`-`}</td>
          </tr>
          `).join(``)}
        </tbody>
      </table>
      `:`<p>Aucune tâche en cours à exporter</p>`}
      
      <script>window.onload = () => { window.print(); }<\/script>
    </body>
    </html>
  `;r.document.write(i),r.document.close()},r=(e,t)=>{let n=e.filter(e=>!e.completed),r=`
Tâches ${t?`de ${t}`:``}
===============================

${n.length>0?n.map((e,t)=>`
${t+1}. ${e.title}
   Description: ${e.description||`-`}
   Priorité: ${e.priority}
   Échéance: ${new Date(e.dueDate).toLocaleDateString()}
   Statut: En cours
   Créateur: ${e.createdByUsername||`-`}
`).join(``):`Aucune tâche en cours à exporter`}
`,i=new Blob([r],{type:`application/msword`}),a=URL.createObjectURL(i),o=document.createElement(`a`);o.href=a,o.download=`taches-${t||`tous`}.doc`,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(a)};export{e as exportToPDF,t as exportToWord,n as exportTodosToPDF,r as exportTodosToWord};