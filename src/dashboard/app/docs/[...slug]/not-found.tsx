import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold text-slate-100 mb-4">404</h1>
      <p className="text-xl text-slate-400 mb-8">Documentation page not found</p>
      <Link
        href="/docs"
        className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        Back to Documentation
      </Link>
    </div>
  );
}

