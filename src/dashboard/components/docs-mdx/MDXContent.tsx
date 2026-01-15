'use client';

import { useMemo } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import { mdxComponents } from '@/lib/docs-mdx/mdx-components';

interface MDXContentProps {
  code: string;
}

export function MDXContent({ code }: MDXContentProps) {
  const Component = useMemo(() => {
    // Velite's compiled MDX does: const{Fragment:e,jsx:n,jsxs:i}=arguments[0]
    // Create a function and call it with the JSX runtime as first argument
    const fn = new Function(`
      ${code}
      return _createMdxContent;
    `);

    // Execute with { Fragment, jsx, jsxs } available in arguments
    const module = fn.call(null, { Fragment, jsx, jsxs });

    // Velite returns { default: Component }, so extract the default export
    const result = module?.default || module;

    // Verify it's a function
    if (typeof result !== 'function') {
      console.error('MDX compilation error: expected function, got:', typeof result, module);
      return () => null;
    }

    return result;
  }, [code]);

  return <Component components={mdxComponents} />;
}
