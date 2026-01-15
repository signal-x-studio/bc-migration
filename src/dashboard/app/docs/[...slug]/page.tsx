import { notFound } from 'next/navigation';
import { docs } from '#site/content';
import { DocsLayout } from '@/components/docs-mdx/DocsLayout';
import { DocsSidebar } from '@/components/docs-mdx/DocsSidebar';
import { TableOfContents } from '@/components/docs-mdx/TableOfContents';
import { Breadcrumbs } from '@/components/docs-mdx/Breadcrumbs';
import { generateNavigation } from '@/lib/docs-mdx/navigation';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/lib/docs-mdx/mdx-components';

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

// Generate static params for all documentation pages
export async function generateStaticParams() {
  return docs.map((doc) => ({
    slug: doc.slug.split('/'),
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const slugPath = slug.join('/');
  const doc = docs.find((d) => d.slug === slugPath);

  if (!doc) {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: `${doc.title} | BC Migration Docs`,
    description: doc.description || doc.title,
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const slugPath = slug.join('/');

  // Find the document by slug
  const doc = docs.find((d) => d.slug === slugPath);

  if (!doc) {
    notFound();
  }

  // Generate breadcrumbs from slug
  const breadcrumbs = [
    { label: 'Docs', href: '/docs' },
    ...slug.slice(0, -1).map((segment, index) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      href: `/docs/${slug.slice(0, index + 1).join('/')}`,
    })),
    { label: doc.title },
  ];

  // Generate navigation from all docs
  const navigation = generateNavigation(docs);

  return (
    <DocsLayout
      sidebar={<DocsSidebar navigation={navigation} />}
      toc={doc.toc ? <TableOfContents headings={doc.toc} /> : undefined}
    >
      <article className="prose dark:prose-invert max-w-none">
        <Breadcrumbs items={breadcrumbs} />
        <h1>{doc.title}</h1>
        {doc.description && (
          <p className="lead text-lg text-slate-600 dark:text-slate-400">
            {doc.description}
          </p>
        )}
        <MDXRemote source={doc.content} components={mdxComponents} />
      </article>
    </DocsLayout>
  );
}

