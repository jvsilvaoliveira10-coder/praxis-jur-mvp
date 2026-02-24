import ReactMarkdown from 'react-markdown';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
      }`}>
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>
      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
        isUser 
          ? 'bg-primary text-primary-foreground rounded-tr-sm' 
          : 'bg-muted/60 text-foreground rounded-tl-sm'
      }`}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert [&_p]:my-1 [&_li]:my-0 [&_blockquote]:border-primary/30 [&_code]:text-xs [&_code]:bg-background/50 [&_code]:px-1 [&_code]:rounded">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
