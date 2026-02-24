import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExt from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import EditorToolbar from './EditorToolbar';
import './editor-styles.css';
import { useEffect } from 'react';

// Convert plain text (from AI) to simple HTML
function plainTextToHtml(text: string): string {
  if (!text) return '';
  // If already HTML, return as-is
  if (text.includes('<p>') || text.includes('<h')) return text;
  
  const lines = text.split('\n');
  const html: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Uppercase lines -> h2
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && /[A-ZÀ-Ú]/.test(trimmed)) {
      html.push(`<h2>${trimmed}</h2>`);
    }
    // Roman numeral lines -> h3
    else if (/^(I{1,3}|IV|V|VI{0,3}|IX|X)\s*[-–—.]/.test(trimmed)) {
      html.push(`<h3>${trimmed}</h3>`);
    }
    else {
      html.push(`<p>${trimmed}</p>`);
    }
  }
  
  return html.join('');
}

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const RichTextEditor = ({ content, onChange, placeholder, disabled }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      UnderlineExt,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'justify',
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Comece a escrever sua petição...',
      }),
    ],
    content: plainTextToHtml(content),
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update content from outside (AI streaming)
  useEffect(() => {
    if (editor && content) {
      const currentHtml = editor.getHTML();
      const newHtml = plainTextToHtml(content);
      // Only update if substantially different (avoid cursor jumps)
      if (newHtml && currentHtml !== newHtml && Math.abs(newHtml.length - currentHtml.length) > 5) {
        editor.commands.setContent(newHtml);
      }
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  return (
    <div className="legal-editor">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
