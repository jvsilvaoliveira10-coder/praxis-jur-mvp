import { type Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bold, Italic, Underline, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Undo, Redo,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface EditorToolbarProps {
  editor: Editor | null;
}

const ToolBtn = ({ active, onClick, icon: Icon, label }: { active?: boolean; onClick: () => void; icon: any; label: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
        onClick={onClick}
        type="button"
      >
        <Icon className="w-4 h-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent side="bottom"><p>{label}</p></TooltipContent>
  </Tooltip>
);

const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  if (!editor) return null;

  return (
    <div className="flex items-center flex-wrap gap-0.5 p-2 border border-b-0 border-border rounded-t-xl bg-muted/30">
      <ToolBtn icon={Bold} label="Negrito (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
      <ToolBtn icon={Italic} label="Itálico (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
      <ToolBtn icon={Underline} label="Sublinhado (Ctrl+U)" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} />
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      <ToolBtn icon={Heading1} label="Título 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
      <ToolBtn icon={Heading2} label="Título 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
      <ToolBtn icon={Heading3} label="Título 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      <ToolBtn icon={List} label="Lista" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
      <ToolBtn icon={ListOrdered} label="Lista Numerada" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
      <ToolBtn icon={Quote} label="Citação" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      <ToolBtn icon={AlignLeft} label="Alinhar Esquerda" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} />
      <ToolBtn icon={AlignCenter} label="Centralizar" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} />
      <ToolBtn icon={AlignRight} label="Alinhar Direita" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} />
      <ToolBtn icon={AlignJustify} label="Justificar" active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()} />
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      <ToolBtn icon={Undo} label="Desfazer" onClick={() => editor.chain().focus().undo().run()} />
      <ToolBtn icon={Redo} label="Refazer" onClick={() => editor.chain().focus().redo().run()} />
    </div>
  );
};

export default EditorToolbar;
