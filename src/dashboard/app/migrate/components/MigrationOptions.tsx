'use client';

import { useEffect, useState } from 'react';
import {
  Settings,
  Link2,
  FileText,
  Hash,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { MigrationOptions } from '@/lib/types';
import { DEFAULT_MIGRATION_OPTIONS } from '@/lib/types';
import { saveMigrationOptions, loadMigrationOptions } from '@/lib/storage';

interface MigrationOptionsProps {
  onChange?: (options: MigrationOptions) => void;
  compact?: boolean;
}

export function MigrationOptionsPanel({ onChange, compact = false }: MigrationOptionsProps) {
  const [options, setOptions] = useState<MigrationOptions>(DEFAULT_MIGRATION_OPTIONS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = loadMigrationOptions();
    setOptions(saved);
  }, []);

  const handleOptionChange = (key: keyof MigrationOptions, value: boolean) => {
    const newOptions = { ...options, [key]: value };
    setOptions(newOptions);
    saveMigrationOptions(newOptions);
    onChange?.(newOptions);
  };

  if (!mounted) {
    return null;
  }

  if (compact) {
    return (
      <div className="space-y-3">
        <OptionToggle
          id="preserveSourceIds"
          checked={options.preserveSourceIds}
          onChange={(v) => handleOptionChange('preserveSourceIds', v)}
          label="Store original WC IDs"
          description="Preserves source IDs in BC metadata"
          icon={<Hash className="w-4 h-4" />}
        />
        <OptionToggle
          id="createRedirects"
          checked={options.createRedirects}
          onChange={(v) => handleOptionChange('createRedirects', v)}
          label="Create 301 redirects"
          description="Auto-redirect old URLs to new BC URLs"
          icon={<Link2 className="w-4 h-4" />}
        />
        <OptionToggle
          id="stripHtmlFromNames"
          checked={options.stripHtmlFromNames}
          onChange={(v) => handleOptionChange('stripHtmlFromNames', v)}
          label="Strip HTML from names"
          description="Remove HTML tags from product/category names"
          icon={<FileText className="w-4 h-4" />}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          Migration Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-400">
          Configure additional options for your migration. These settings apply to all entity types.
        </p>

        <div className="space-y-4 mt-4">
          {/* ID Preservation */}
          <OptionCard
            id="preserveSourceIds"
            checked={options.preserveSourceIds}
            onChange={(v) => handleOptionChange('preserveSourceIds', v)}
            label="Store Original WC IDs in BigCommerce"
            description="Preserves source IDs in BC product/customer metadata for reference and potential rollback. Useful for cross-referencing data between stores."
            icon={<Hash className="w-5 h-5 text-purple-400" />}
            recommended
          />

          {/* 301 Redirects */}
          <OptionCard
            id="createRedirects"
            checked={options.createRedirects}
            onChange={(v) => handleOptionChange('createRedirects', v)}
            label="Create 301 Redirects Automatically"
            description="Automatically creates URL redirects in BigCommerce after migration. Redirects old WooCommerce product/category URLs to new BigCommerce URLs for SEO continuity."
            icon={<Link2 className="w-5 h-5 text-green-400" />}
            recommended
          />

          {/* Strip HTML from Names */}
          <OptionCard
            id="stripHtmlFromNames"
            checked={options.stripHtmlFromNames}
            onChange={(v) => handleOptionChange('stripHtmlFromNames', v)}
            label="Strip HTML Tags from Names"
            description="Removes HTML formatting from product and category names. Useful if your WooCommerce data contains HTML tags in names that shouldn't appear in BigCommerce."
            icon={<FileText className="w-5 h-5 text-orange-400" />}
          />

          {/* Strip HTML from Descriptions */}
          <OptionCard
            id="stripHtmlFromDescriptions"
            checked={options.stripHtmlFromDescriptions}
            onChange={(v) => handleOptionChange('stripHtmlFromDescriptions', v)}
            label="Strip HTML Tags from Descriptions"
            description="Removes all HTML formatting from product and category descriptions. Warning: This will remove intentional formatting like bold, lists, and links."
            icon={<FileText className="w-5 h-5 text-yellow-400" />}
            warning="May remove intentional formatting"
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface OptionCardProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
  icon: React.ReactNode;
  recommended?: boolean;
  warning?: string;
}

function OptionCard({
  id,
  checked,
  onChange,
  label,
  description,
  icon,
  recommended,
  warning,
}: OptionCardProps) {
  return (
    <label
      htmlFor={id}
      className={`
        flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors
        ${checked
          ? 'bg-blue-900/20 border-blue-600'
          : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
        }
      `}
    >
      <div className="flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`
            w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
            ${checked
              ? 'bg-blue-600 border-blue-600'
              : 'bg-transparent border-gray-500'
            }
          `}
        >
          {checked && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      <div className="flex-grow">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-white">{label}</span>
          {recommended && (
            <span className="px-2 py-0.5 text-xs bg-green-900/50 text-green-400 rounded-full">
              Recommended
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
        {warning && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-yellow-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            {warning}
          </div>
        )}
      </div>
    </label>
  );
}

interface OptionToggleProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
  icon: React.ReactNode;
}

function OptionToggle({
  id,
  checked,
  onChange,
  label,
  description,
  icon,
}: OptionToggleProps) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-3 cursor-pointer group"
    >
      <div className="flex-shrink-0">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`
            w-10 h-6 rounded-full transition-colors relative
            ${checked ? 'bg-blue-600' : 'bg-gray-600'}
          `}
        >
          <div
            className={`
              absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
              ${checked ? 'left-5' : 'left-1'}
            `}
          />
        </div>
      </div>
      <div className="flex-grow">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">{icon}</span>
          <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
            {label}
          </span>
        </div>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </label>
  );
}

export default MigrationOptionsPanel;
