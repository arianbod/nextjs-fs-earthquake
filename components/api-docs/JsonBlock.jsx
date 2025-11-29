import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export default function JsonBlock({ title, json, type = "schema" }) {
  const customStyle = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      background: '#1e1e1e',
      padding: '1rem',
      borderRadius: '0.375rem',
      fontSize: '0.75rem',
      lineHeight: '1.5',
    }
  };

  return (
    <div className="mb-3">
      <p className="text-xs font-mono text-gray-500 mb-1">{title}:</p>
      <SyntaxHighlighter
        language="json"
        style={customStyle}
        customStyle={{
          margin: 0,
          borderRadius: '0.375rem',
        }}
      >
        {typeof json === 'string' ? json : JSON.stringify(json, null, 2)}
      </SyntaxHighlighter>
    </div>
  );
}
