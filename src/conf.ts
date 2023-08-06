import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import JSON from 'highlight.js/lib/languages/json';
import javascript from 'highlight.js/lib/languages/javascript';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', JSON);

function getServerUrl(): string {
  let url = "http://localhost:5143";
  const urlConf = import.meta.env.VITE_SERVER_URL;
  if (urlConf) {
    url = urlConf
  } else {
    if (import.meta.env.DEV) {
      url = "http://localhost:5173";
    }
  }
  return url
}

export { hljs, getServerUrl }