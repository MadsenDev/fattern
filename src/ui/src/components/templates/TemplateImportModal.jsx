import { useState } from 'react';
import { FiX, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { Modal } from '../Modal';

export function TemplateImportModal({ isOpen, onClose, onConfirm, templateMeta, validationIssues, warnings }) {
  if (!isOpen) return null;

  const hasErrors = validationIssues?.some(issue => issue.level === 'error') || false;
  const hasWarnings = warnings?.length > 0 || validationIssues?.some(issue => issue.level === 'warning') || false;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Importer mal"
      size="md"
    >
      <div className="space-y-4">
        {templateMeta && (
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-ink mb-2">Mal informasjon</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-subtle">Navn:</span>
                  <span className="font-medium text-ink">{templateMeta.name}</span>
                </div>
                {templateMeta.author && (
                  <div className="flex justify-between">
                    <span className="text-ink-subtle">Forfatter:</span>
                    <span className="font-medium text-ink">{templateMeta.author}</span>
                  </div>
                )}
                {templateMeta.version && (
                  <div className="flex justify-between">
                    <span className="text-ink-subtle">Versjon:</span>
                    <span className="font-medium text-ink">{templateMeta.version}</span>
                  </div>
                )}
                {templateMeta.tags && templateMeta.tags.length > 0 && (
                  <div className="flex justify-between items-start">
                    <span className="text-ink-subtle">Tagger:</span>
                    <div className="flex flex-wrap gap-1">
                      {templateMeta.tags.map((tag, idx) => (
                        <span key={idx} className="inline-flex items-center rounded-full bg-cloud px-2 py-0.5 text-xs font-medium text-ink-subtle">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {templateMeta.description && (
                  <div className="pt-2 border-t border-sand/40">
                    <p className="text-xs text-ink-soft">{templateMeta.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {hasErrors && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
            <div className="flex items-start gap-2">
              <FiAlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h5 className="text-sm font-semibold text-rose-900 mb-1">Valideringsfeil</h5>
                <ul className="text-xs text-rose-700 space-y-1">
                  {validationIssues
                    .filter(issue => issue.level === 'error')
                    .map((issue, idx) => (
                      <li key={idx}>• {issue.path}: {issue.message}</li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {hasWarnings && !hasErrors && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-start gap-2">
              <FiInfo className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h5 className="text-sm font-semibold text-amber-900 mb-1">Advarsler</h5>
                <ul className="text-xs text-amber-700 space-y-1">
                  {warnings?.map((warning, idx) => (
                    <li key={idx}>• {warning}</li>
                  ))}
                  {validationIssues
                    ?.filter(issue => issue.level === 'warning')
                    .map((issue, idx) => (
                      <li key={idx}>• {issue.path}: {issue.message}</li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {!hasErrors && !hasWarnings && (
          <div className="rounded-lg border border-brand-200 bg-brand-50 p-3">
            <div className="flex items-start gap-2">
              <FiCheckCircle className="h-5 w-5 text-brand-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-brand-700">Malen ser ut til å være gyldig og klar for import.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-sand/40">
        <button
          onClick={onClose}
          className="rounded-lg border border-sand/60 bg-white px-4 py-2 text-sm font-medium text-ink-soft hover:bg-cloud transition"
        >
          Avbryt
        </button>
        <button
          onClick={onConfirm}
          disabled={hasErrors}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
            hasErrors
              ? 'bg-cloud text-ink-subtle cursor-not-allowed'
              : 'bg-brand-700 hover:bg-brand-800'
          }`}
        >
          Importer
        </button>
      </div>
    </Modal>
  );
}

