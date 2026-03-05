import {createRoot} from 'react-dom/client'
import App from 'src/App.tsx';

const rootElement = document.getElementById('root')

if (rootElement) {
    createRoot(rootElement).render(<App />)
} else {
    console.error('未找到id为root的DOM容器，请检查页面结构')
}