import { getDocByPath, getAllDocs } from '@/lib/docs/loader';
import { processHTML } from '@/lib/docs/processor';
import { notFound } from 'next/navigation';
import { DocsContent } from '@/components/docs/DocsContent';

export async function generateStaticParams() {
  const docs = getAllDocs();
  return docs.map(doc => {
    const segments = doc.fullPath.split('/').filter(Boolean);
    return {
      slug: segments.length > 0 ? segments : ['index'],
    };
  }).map(params => ({
    slug: params.slug,
  }));
}

export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug?: string[] | string }>;
}) {
  // Next.js 16 requires params to be awaited
  const resolvedParams = await params;
  
  // Handle both array and string formats, and ensure it's an array
  let slugArray: string[] = [];
  if (resolvedParams.slug) {
    slugArray = Array.isArray(resolvedParams.slug) ? resolvedParams.slug : [resolvedParams.slug];
  }
  
  const doc = getDocByPath(slugArray);
  
  if (!doc) {
    notFound();
  }
  
  const processedHTML = processHTML(doc.content);
  
  // Use a stable key based on the document path to ensure consistent rendering
  const contentKey = doc.fullPath;
  
  return (
    <DocsContent>
      <article className="docs-article">
        <header className="mb-8 pb-6 border-b border-slate-800">
          <h1 className="text-4xl font-bold text-slate-100 mb-3">
            {doc.metadata.title}
          </h1>
          {doc.metadata.description && (
            <p className="text-lg text-slate-400 leading-relaxed">
              {doc.metadata.description}
            </p>
          )}
        </header>
        <div
          key={contentKey}
          className="docs-html-content"
          dangerouslySetInnerHTML={{ __html: processedHTML }}
          suppressHydrationWarning
        />
      </article>
    </DocsContent>
  );
}

