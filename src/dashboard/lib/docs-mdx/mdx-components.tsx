import { CodeBlock, Callout, Tabs, Tab, ApiEndpoint } from '@/components/docs-mdx';
import { CodeExample, TypeSignature, ApiReference } from '@/components/docs';
import type { MDXComponents } from 'mdx/types';

/**
 * Generate heading ID from text content
 * Must match the algorithm in velite-build.mjs
 */
function generateHeadingId(children: any): string {
  // Extract text content from children (handles string, array, or nested elements)
  const extractText = (node: any): string => {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (node?.props?.children) return extractText(node.props.children);
    return '';
  };

  const text = extractText(children);

  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const mdxComponents: MDXComponents = {
  // Custom components
  CodeBlock,
  Callout,
  Tabs,
  Tab,
  ApiEndpoint,
  CodeExample,
  TypeSignature,
  ApiReference,

  // Override default markdown elements
  pre: ({ children, ...props }: any) => {
    // Extract code block content and language
    const codeElement = children?.props;
    const language = codeElement?.className?.replace('language-', '') || 'text';
    const code = codeElement?.children || '';

    return (
      <CodeBlock language={language} {...props}>
        {code}
      </CodeBlock>
    );
  },

  code: ({ children, className, ...props }: any) => {
    // Inline code (not in pre)
    if (!className) {
      return (
        <code
          className="px-1.5 py-0.5 text-sm font-mono bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded"
          {...props}
        >
          {children}
        </code>
      );
    }

    // This will be wrapped by pre above
    return <code className={className} {...props}>{children}</code>;
  },

  a: ({ href, children, ...props }: any) => {
    const isExternal = href?.startsWith('http');

    return (
      <a
        href={href}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline underline-offset-2 transition-colors"
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        {...props}
      >
        {children}
      </a>
    );
  },

  h1: ({ children, ...props }: any) => {
    const id = generateHeadingId(children);
    return (
      <h1
        id={id}
        className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-6 scroll-mt-20"
        {...props}
      >
        {children}
      </h1>
    );
  },

  h2: ({ children, ...props }: any) => {
    const id = generateHeadingId(children);
    return (
      <h2
        id={id}
        className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mt-12 mb-4 scroll-mt-20"
        {...props}
      >
        {children}
      </h2>
    );
  },

  h3: ({ children, ...props }: any) => {
    const id = generateHeadingId(children);
    return (
      <h3
        id={id}
        className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-8 mb-3 scroll-mt-20"
        {...props}
      >
        {children}
      </h3>
    );
  },

  h4: ({ children, ...props }: any) => {
    const id = generateHeadingId(children);
    return (
      <h4
        id={id}
        className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-6 mb-2 scroll-mt-20"
        {...props}
      >
        {children}
      </h4>
    );
  },

  p: ({ children, ...props }: any) => (
    <p className="text-slate-700 dark:text-slate-300 leading-relaxed my-4" {...props}>
      {children}
    </p>
  ),

  ul: ({ children, ...props }: any) => (
    <ul className="list-disc list-outside ml-6 my-4 space-y-2 text-slate-700 dark:text-slate-300" {...props}>
      {children}
    </ul>
  ),

  ol: ({ children, ...props }: any) => (
    <ol className="list-decimal list-outside ml-6 my-4 space-y-2 text-slate-700 dark:text-slate-300" {...props}>
      {children}
    </ol>
  ),

  li: ({ children, ...props }: any) => (
    <li className="leading-relaxed" {...props}>
      {children}
    </li>
  ),

  blockquote: ({ children, ...props }: any) => (
    <blockquote
      className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 pl-4 py-2 my-6 text-slate-700 dark:text-slate-300"
      {...props}
    >
      {children}
    </blockquote>
  ),

  table: ({ children, ...props }: any) => (
    <div className="my-6 overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700" {...props}>
        {children}
      </table>
    </div>
  ),

  thead: ({ children, ...props }: any) => (
    <thead className="bg-slate-50 dark:bg-slate-800" {...props}>
      {children}
    </thead>
  ),

  th: ({ children, ...props }: any) => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider"
      {...props}
    >
      {children}
    </th>
  ),

  td: ({ children, ...props }: any) => (
    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300" {...props}>
      {children}
    </td>
  ),

  hr: ({ ...props }: any) => (
    <hr className="my-8 border-slate-200 dark:border-slate-700" {...props} />
  ),
};
