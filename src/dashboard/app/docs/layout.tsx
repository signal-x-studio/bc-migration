// Layout wrapper - don't wrap in DocsLayout here, it's done in individual pages
export default function DocsLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

