const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir);

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    let content = fs.readFileSync(path.join(pagesDir, file), 'utf8');
    
    // Remove unused React import
    content = content.replace(/import React from 'react';\n/g, '');

    // Convert 'class=' to 'className='
    content = content.replace(/\bclass=/g, 'className=');
    
    // Convert HTML comments to JSX comments
    content = content.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

    // Fix some SVG properties that might be missed
    content = content.replace(/fill-opacity=/g, 'fillOpacity=');
    content = content.replace(/stroke-opacity=/g, 'strokeOpacity=');
    content = content.replace(/stroke-width=/g, 'strokeWidth=');
    content = content.replace(/stroke-linecap=/g, 'strokeLinecap=');
    content = content.replace(/stroke-linejoin=/g, 'strokeLinejoin=');

    // Fix 'for=' if it exists (htmlFor)
    content = content.replace(/\bfor=/g, 'htmlFor=');

    // Fix boolean attributes
    content = content.replace(/\bchecked="checked"/gi, 'defaultChecked={true}');
    content = content.replace(/\bchecked="true"/gi, 'defaultChecked={true}');
    content = content.replace(/\brequired="required"/gi, 'required={true}');
    content = content.replace(/\brequired="true"/gi, 'required={true}');
    content = content.replace(/\bselected="selected"/gi, 'defaultValue={true}');
    content = content.replace(/\bdisabled="disabled"/gi, 'disabled={true}');
    content = content.replace(/\breadonly="readonly"/gi, 'readOnly={true}');
    content = content.replace(/\bchecked=""/gi, 'defaultChecked={true}');
    content = content.replace(/\brequired=""/gi, 'required={true}');
    
    // Fix event handlers
    content = content.replace(/\bonsubmit=/gi, 'onSubmit=');
    content = content.replace(/\bonclick=/gi, 'onClick=');
    content = content.replace(/\bonchange=/gi, 'onChange=');

    // Convert style="width: 100%" to style={{width: '100%'}}
    content = content.replace(/style="([^"]*)"/g, (match, p1) => {
      const styles = p1.split(';').filter(s => s.trim() !== '');
      const styleObj = {};
      styles.forEach(s => {
        const parts = s.split(':');
        if (parts.length >= 2) {
          const key = parts[0].trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
          const val = parts.slice(1).join(':').trim();
          styleObj[key] = val;
        }
      });
      return `style={${JSON.stringify(styleObj)}}`;
    });

    fs.writeFileSync(path.join(pagesDir, file), content);
  }
});
console.log('Fixed styles, booleans, and event handlers in TSX files');
