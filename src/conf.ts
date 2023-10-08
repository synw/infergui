import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import JSON from 'highlight.js/lib/languages/json';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';

hljs.registerLanguage('python', python);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', JSON);

function getServerUrl(): string {
  let url = "http://localhost:5143";
  const urlConf = import.meta.env.VITE_SERVER_URL;
  if (urlConf) {
    url = urlConf
  }
  //console.log("Server url:", url)
  return url
}

export { hljs, getServerUrl }