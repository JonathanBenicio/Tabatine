'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export function SubmitButton({ children, loadingText = 'Carregando...', className, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      type="submit"
      disabled={pending || props.disabled}
      className={`${className} flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed`}
    >
      {pending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
