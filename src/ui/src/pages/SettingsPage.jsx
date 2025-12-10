import { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useToast } from '../hooks/useToast';
import { ConfirmModal } from '../components/ConfirmModal';
import { TemplateImportModal } from '../components/templates/TemplateImportModal';
import { SETTING_CATEGORIES, CATEGORY_DESCRIPTIONS } from '../utils/settingsConstants';
import { SettingsSidebar } from '../components/settings/SettingsSidebar';
import { GeneralSettings } from '../components/settings/GeneralSettings';
import { DefaultsSettings } from '../components/settings/DefaultsSettings';
import { InvoiceSettings } from '../components/settings/InvoiceSettings';
import { CompanySettings } from '../components/settings/CompanySettings';
import { TemplatesSettings } from '../components/settings/TemplatesSettings';
import { AppearanceSettings } from '../components/settings/AppearanceSettings';
import { ImportSettings } from '../components/settings/ImportSettings';
import { AboutSettings } from '../components/settings/AboutSettings';
import { DevSettings } from '../components/settings/DevSettings';
import { getTemplateId, getTemplateName } from '../utils/templateUtils';

export function SettingsPage({ company, onCompanyUpdate, onOpenTemplateEditor, onRefreshData }) {
  const { getSetting, updateSetting } = useSettings();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState('general');
  const [showDevMenu, setShowDevMenu] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, templateId: null, templateName: null });
  const [importModal, setImportModal] = useState({ isOpen: false, packagePath: null, templateMeta: null, validationIssues: [], warnings: [] });
  const defaultTemplateId = getSetting('invoice.defaultTemplate', 'default_invoice');

  // Keyboard shortcut to toggle dev menu (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        setShowDevMenu((prev) => !prev);
        if (!showDevMenu) {
          setActiveCategory('dev');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDevMenu]);

  const handleSetDefaultTemplate = async (templateId) => {
    try {
      updateSetting('invoice.defaultTemplate', templateId);
      toast.success('Standard mal oppdatert', `"${templateId}" er nå standard`);
    } catch (error) {
      console.error('Failed to set default template', error);
      toast.error('Kunne ikke sette standard mal', error.message);
    }
  };

  const handleDeleteTemplate = (templateId) => {
    if (templateId === 'default_invoice') {
      toast.error('Kan ikke slette standard mal', 'Du kan ikke slette standard malen');
      return;
    }

    // We need to get the template name - this will be handled by TemplatesSettings
    setDeleteConfirm({
      isOpen: true,
      templateId,
      templateName: templateId, // Will be updated if we have access to templates list
    });
  };

  const confirmDeleteTemplate = async () => {
    const { templateId } = deleteConfirm;
    if (!templateId) return;

    try {
      const api = typeof window !== 'undefined' ? window.fattern?.template : null;
      if (!api) return;

      await api.delete(templateId);
      toast.success('Mal slettet', 'Malen har blitt slettet');
    } catch (error) {
      console.error('Failed to delete template', error);
      toast.error('Kunne ikke slette mal', error.message);
    } finally {
      setDeleteConfirm({ isOpen: false, templateId: null, templateName: null });
    }
  };

  const handleImportTemplate = async () => {
    try {
      const dialogApi = window.fattern?.dialog;
      const api = window.fattern?.template;
      if (!dialogApi || !api) {
        toast.error('Import ikke tilgjengelig', 'Dialog API ikke tilgjengelig');
        return;
      }

      const result = await dialogApi.showOpenDialog({
        title: 'Importer mal',
        filters: [
          { name: 'Fattern Template', extensions: ['fattern-template'] },
          { name: 'All Files', extensions: ['*'] },
        ],
        properties: ['openFile'],
      });

      if (result.canceled || !result.filePaths || result.filePaths.length === 0) return;

      const packagePath = result.filePaths[0];

      // Validate package first (without importing)
      const validationResult = await api.validatePackage(packagePath);

      // Show import modal with template info
      setImportModal({
        isOpen: true,
        packagePath,
        templateMeta: validationResult.meta,
        validationIssues: validationResult.issues || [],
        warnings: validationResult.warnings || [],
      });
    } catch (error) {
      console.error('Failed to import template', error);
      toast.error('Kunne ikke importere mal', error.message);
    }
  };

  const handleConfirmImport = async () => {
    try {
      const api = window.fattern?.template;
      if (!api) return;

      const result = await api.importPackage(importModal.packagePath);
      
      toast.success('Mal importert', `"${result.meta.name}" er importert${result.finalId !== result.meta.id ? ` som "${result.finalId}"` : ''}`);
      
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          toast.warning('Import advarsel', warning);
        });
      }

      setImportModal({ isOpen: false, packagePath: null, templateMeta: null, validationIssues: [], warnings: [] });
    } catch (error) {
      console.error('Failed to import template', error);
      toast.error('Kunne ikke importere mal', error.message);
    }
  };

  const renderContent = () => {
    switch (activeCategory) {
      case 'general':
        return <GeneralSettings />;
      case 'defaults':
        return <DefaultsSettings />;
      case 'invoice':
        return <InvoiceSettings />;
      case 'company':
        return <CompanySettings company={company} onCompanyUpdate={onCompanyUpdate} />;
      case 'templates':
        return (
          <TemplatesSettings
            onOpenTemplateEditor={onOpenTemplateEditor}
            onDeleteTemplate={handleDeleteTemplate}
            onSetDefaultTemplate={handleSetDefaultTemplate}
            onImportTemplate={handleImportTemplate}
          />
        );
      case 'appearance':
        return <AppearanceSettings />;
      case 'import':
        return <ImportSettings onRefreshData={onRefreshData} />;
      case 'about':
        return <AboutSettings />;
      case 'dev':
        return <DevSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  const activeCategoryLabel = SETTING_CATEGORIES.find((c) => c.id === activeCategory)?.label || 'Innstillinger';
  const activeCategoryDescription = CATEGORY_DESCRIPTIONS[activeCategory] || '';

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      <div className="flex w-full gap-6">
        <SettingsSidebar
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          showDevMenu={showDevMenu}
        />

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="rounded-2xl border border-sand/60 bg-white shadow-card overflow-hidden">
            <div className="border-b border-sand/60 bg-gradient-to-br from-brand-50/40 to-transparent px-8 py-6">
              <h2 className="text-2xl font-semibold text-ink">{activeCategoryLabel}</h2>
              <p className="text-sm text-ink-soft mt-2">{activeCategoryDescription}</p>
            </div>

            <div className="p-8">
              <div className={activeCategory === 'templates' ? '' : 'max-w-2xl'}>{renderContent()}</div>
            </div>
          </div>
        </main>
      </div>

      <TemplateImportModal
        isOpen={importModal.isOpen}
        onClose={() => setImportModal({ isOpen: false, packagePath: null, templateMeta: null, validationIssues: [], warnings: [] })}
        onConfirm={handleConfirmImport}
        templateMeta={importModal.templateMeta}
        validationIssues={importModal.validationIssues}
        warnings={importModal.warnings}
      />
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, templateId: null, templateName: null })}
        onConfirm={confirmDeleteTemplate}
        title="Slett mal"
        description={`Er du sikker på at du vil slette malen "${deleteConfirm.templateName}"? Denne handlingen kan ikke angres.`}
        confirmLabel="Slett"
        cancelLabel="Avbryt"
        variant="danger"
      />
    </div>
  );
}
