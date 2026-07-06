const fs = require('fs');
const path = require('path');

const convertHtmlToReact = (htmlPath, componentName) => {
  if (!fs.existsSync(htmlPath)) return;
  let html = fs.readFileSync(htmlPath, 'utf8');
  let bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) return;
  let bodyContent = bodyMatch[1];

  bodyContent = bodyContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  bodyContent = bodyContent.replace(/class=/g, 'className=');

  const attrMap = {
    'stroke-width': 'strokeWidth',
    'stroke-linecap': 'strokeLinecap',
    'stroke-linejoin': 'strokeLinejoin',
    'fill-rule': 'fillRule',
    'clip-rule': 'clipRule',
    'stroke-miterlimit': 'strokeMiterlimit',
    'viewbox': 'viewBox',
    'xmlns:xlink': 'xmlnsXlink'
  };
  for (const [key, value] of Object.entries(attrMap)) {
    const regex = new RegExp(`\\b${key}=`, 'gi');
    bodyContent = bodyContent.replace(regex, `${value}=`);
  }

  const voidTags = ['img', 'input', 'hr', 'br', 'source'];
  voidTags.forEach(tag => {
    const regex = new RegExp(`(<${tag}\\b[^>]*)(?<!\/)>`, 'gi');
    bodyContent = bodyContent.replace(regex, '$1 />');
  });

  bodyContent = bodyContent.replace(/\bfor=/g, 'htmlFor=');

  const component = `
const ${componentName} = () => {
  return (
    <>
      ${bodyContent}
    </>
  );
};

export default ${componentName};
`;

  fs.writeFileSync(path.join(__dirname, 'src', 'pages', `${componentName}.tsx`), component);
  console.log(`Converted ${componentName}`);
};

convertHtmlToReact('./DistressRiskWatch.html', 'DistressRiskWatch');
convertHtmlToReact('./DesktopLanding.html', 'DesktopLanding');
convertHtmlToReact('./MarketHeatmap.html', 'MarketHeatmap');
convertHtmlToReact('./OfficialSignIn.html', 'OfficialSignIn');
