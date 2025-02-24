import React from "react";

export const MarkdownComponents = {
  p({ children, ...props }: React.HTMLProps<HTMLParagraphElement>) {
    return (
      <p className="mb-2 last:mb-0" {...props}>
        {children}
      </p>
    );
  },
  h1({ children, ...props }: React.HTMLProps<HTMLHeadingElement>) {
    return (
      <h1 className="text-bold text-2xl" {...props}>
        {children}
      </h1>
    );
  },
  h2({ children, ...props }: React.HTMLProps<HTMLHeadingElement>) {
    return (
      <h2 className="text-bold text-xl" {...props}>
        {children}
      </h2>
    );
  },
  h3({ children, ...props }: React.HTMLProps<HTMLHeadingElement>) {
    return (
      <h3 className="text-bold text-lg" {...props}>
        {children}
      </h3>
    );
  },
  ol({ children, ...props }: React.OlHTMLAttributes<HTMLOListElement>) {
    return (
      <ol className="list-inside list-decimal" {...props}>
        {children}
      </ol>
    );
  },
  ul({ children, ...props }: React.HTMLProps<HTMLUListElement>) {
    return (
      <ul className="list-inside list-disc" {...props}>
        {children}
      </ul>
    );
  },
  li({ children, ...props }: React.HTMLProps<HTMLLIElement>) {
    return (
      <li className="mb-2 list-item list-inside" {...props}>
        {children}
      </li>
    );
  },
  blockquote({
    children,
    ...props
  }: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) {
    return (
      <blockquote
        className="relative border-s-4 border-gray-800 bg-slate-200 pl-2 ps-4 sm:ps-6"
        {...props}
      >
        {children}
      </blockquote>
    );
  },
};
