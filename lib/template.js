module.exports = {
  HTML: function (title, script, body, authStatusUI) {
    return `
    <!doctype html>
    <html>
    <head>    
      <title>Login TEST - ${title}</title>
      <meta charset="utf-8">  
      <link href="style.css" type="text/css" rel="stylesheet">
      ${script}
    </head>
    <body>
      <div class="background">
        ${authStatusUI}
        ${body}
      </div>
    </body>
    </html>
    `;
  }
}
