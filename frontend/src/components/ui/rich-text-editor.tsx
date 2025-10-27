import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter text...',
  className,
  disabled = false,
  id,
  minHeight = '200px',
}) => {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ align: [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean'],
      ],
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'script',
    'list',
    'bullet',
    'indent',
    'align',
    'blockquote',
    'code-block',
    'link',
    'image',
    'video',
  ];

  return (
    <div className={cn('rich-text-editor-wrapper', className)} id={id}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={disabled}
        style={{
          minHeight,
        }}
        className={cn(
          'bg-background',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />
      <style>{`
        .rich-text-editor-wrapper .ql-container {
          min-height: ${minHeight};
          font-family: inherit;
          font-size: 0.875rem;
        }
        
        .rich-text-editor-wrapper .ql-editor {
          min-height: ${minHeight};
        }
        
        .rich-text-editor-wrapper .ql-toolbar {
          border: 1px solid hsl(var(--border));
          border-radius: 0.5rem 0.5rem 0 0;
          background: hsl(var(--background));
        }
        
        .rich-text-editor-wrapper .ql-container {
          border: 1px solid hsl(var(--border));
          border-top: none;
          border-radius: 0 0 0.5rem 0.5rem;
          background: hsl(var(--background));
        }
        
        .rich-text-editor-wrapper .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
        }
        
        .rich-text-editor-wrapper .ql-stroke {
          stroke: hsl(var(--foreground));
        }
        
        .rich-text-editor-wrapper .ql-fill {
          fill: hsl(var(--foreground));
        }
        
        .rich-text-editor-wrapper .ql-picker-label {
          color: hsl(var(--foreground));
        }
        
        .rich-text-editor-wrapper .ql-picker-options {
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
        }
        
        .rich-text-editor-wrapper .ql-toolbar button:hover,
        .rich-text-editor-wrapper .ql-toolbar button:focus,
        .rich-text-editor-wrapper .ql-toolbar button.ql-active {
          color: hsl(var(--primary));
        }
        
        .rich-text-editor-wrapper .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor-wrapper .ql-toolbar button:focus .ql-stroke,
        .rich-text-editor-wrapper .ql-toolbar button.ql-active .ql-stroke {
          stroke: hsl(var(--primary));
        }
        
        .rich-text-editor-wrapper .ql-toolbar button:hover .ql-fill,
        .rich-text-editor-wrapper .ql-toolbar button:focus .ql-fill,
        .rich-text-editor-wrapper .ql-toolbar button.ql-active .ql-fill {
          fill: hsl(var(--primary));
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
