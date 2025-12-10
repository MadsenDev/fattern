import { useState } from 'react';
import { CSVImportModal } from '../import/CSVImportModal';
import { useToast } from '../../hooks/useToast';

export function ImportSettings({ onRefreshData }) {
  const { toast } = useToast();
  const [csvImportModal, setCsvImportModal] = useState({ isOpen: false, type: 'customer' });

  const handleCSVImport = async (data, type) => {
    try {
      const api = typeof window !== 'undefined' ? window.fattern?.db : null;
      if (!api) {
        throw new Error('Database API ikke tilgjengelig');
      }

      if (type === 'customer') {
        await api.bulkCreateCustomers(data);
        toast.success(`Importert ${data.length} kunder`, 'Kundene er nå tilgjengelige i systemet');
      } else if (type === 'product') {
        await api.bulkCreateProducts(data);
        toast.success(`Importert ${data.length} produkter`, 'Produktene er nå tilgjengelige i systemet');
      }

      if (onRefreshData) {
        onRefreshData();
      }
    } catch (error) {
      console.error('Import feilet:', error);
      toast.error('Import feilet', error.message || 'Kunne ikke importere data');
      throw error;
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-ink mb-1">Importer data</h3>
          <p className="text-xs text-ink-subtle mb-4">Importer kunder, produkter og fakturaer fra CSV eller SAF-T</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-sand/60 bg-white p-6">
            <h4 className="text-sm font-semibold text-ink mb-2">CSV Import</h4>
            <p className="text-xs text-ink-subtle mb-4">
              Importer kunder eller produkter fra CSV-filer. Du kan mappe kolonner manuelt eller bruke AI-auto-mapping (Supporter Pack).
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCsvImportModal({ isOpen: true, type: 'customer' })}
                className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
              >
                Importer kunder
              </button>
              <button
                onClick={() => setCsvImportModal({ isOpen: true, type: 'product' })}
                className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
              >
                Importer produkter
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-sand/60 bg-white p-6">
            <h4 className="text-sm font-semibold text-ink mb-2">SAF-T Import</h4>
            <p className="text-xs text-ink-subtle mb-4">
              Importer data fra SAF-T (Standard Audit File for Tax) filer. Dette er den offisielle, pålitelige importmetoden som støttes av de fleste norske regnskapssystemer.
            </p>
            <button
              disabled
              className="rounded-lg border border-sand/60 bg-cloud/50 px-4 py-2 text-sm font-medium text-ink-subtle cursor-not-allowed"
            >
              SAF-T import (kommer snart)
            </button>
          </div>
        </div>
      </div>

      <CSVImportModal
        isOpen={csvImportModal.isOpen}
        type={csvImportModal.type}
        onClose={() => setCsvImportModal({ isOpen: false, type: 'customer' })}
        onImport={(data) => handleCSVImport(data, csvImportModal.type)}
      />
    </>
  );
}

