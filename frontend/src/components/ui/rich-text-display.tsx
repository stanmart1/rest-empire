import React from 'react';
import { cn } from '@/lib/utils';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

const RichTextDisplay: React.FC<RichTextDisplayProps> = ({ content, className }) => {
  return (
    <div
      className={cn(
        'prose prose-sm max-w-none dark:prose-invert',
        'prose-headings:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
        'prose-img:rounded-lg prose-img:shadow-md',
        'prose-pre:bg-muted prose-pre:text-foreground',
        'prose-code:bg-muted prose-code:text-foreground prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default RichTextDisplay;
