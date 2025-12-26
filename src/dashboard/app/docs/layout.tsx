import { DocsLayout } from '@/components/docs/DocsLayout';

export default function DocsLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DocsLayout>{children}</DocsLayout>;
}

