export interface DocMetadata {
  title: string;
  description?: string;
  category?: string;
  order?: number;
  [key: string]: any;
}

export interface DocFile {
  slug: string;
  content: string;
  metadata: DocMetadata;
  path: string[];
  fullPath: string;
}

export interface DocNavigation {
  category: string;
  items: DocFile[];
}

