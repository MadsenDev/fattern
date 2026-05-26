import { useState, useEffect, useMemo } from 'react';
import { IconLock, IconPackage } from '@tabler/icons-react';
import { useToast } from '../../hooks/useToast';
import { useSettings } from '../../hooks/useSettings';
import { useSupporterPack } from '../../hooks/useSupporterPack';
import { getTemplateId, getTemplateName, getTemplateMeta, isTemplatePremium, isTemplateLocked, isTemplateDefault, isTemplateBuiltIn, isTemplateCustom } from '../../utils/templateUtils';
import { TemplateCard } from './TemplateCard';
import { TemplateFilterSidebar } from './TemplateFilterSidebar';

export function TemplatesSettings({ onOpenTemplateEditor, onDeleteTemplate, onSetDefaultTemplate, onImportTemplate }) {
  const { toast } = useToast();
  const { getSetting } = useSettings();
  const { isSupporter } = useSupporterPack();
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const defaultTemplateId = getSetting('invoice.defaultTemplate', 'default_invoice');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const api = typeof window !== 'undefined' ? window.fattern?.template : null;
      if (!api) {
        console.error('Template API not available');
        return;
      }

      // Ensure default template exists
      await api.createDefault();
      
      // Try to create presets (they won't be created if they already exist)
      try {
        await api.createPresets();
      } catch (error) {
        console.log('Presets may already exist:', error);
      }

      // Load all templates
      const templateList = await api.list();
      setTemplates(templateList || []);
    } catch (error) {
      console.error('Failed to load templates', error);
      toast.error('Kunne ikke laste maler', error.message);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleCreatePremiumTemplates = async () => {
    try {
      const api = typeof window !== 'undefined' ? window.fattern?.template : null;
      if (!api) {
        console.error('Template API not available');
        return;
      }

      await api.createPremium();
      toast.success('Premium maler opprettet', 'De profesjonelle malene er nå tilgjengelige');
      await loadTemplates();
    } catch (error) {
      console.error('Failed to create premium templates', error);
      toast.error('Kunne ikke opprette premium maler', error.message);
    }
  };

  const handleExportTemplate = async (templateId) => {
    try {
      const api = window.fattern?.template;
      const dialogApi = window.fattern?.dialog;
      if (!api || !dialogApi) return;

      const template = templates.find(t => getTemplateId(t) === templateId);
      const templateName = getTemplateName(template) || templateId;
      const filename = `${templateName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.fattern-template`;

      const result = await dialogApi.showSaveDialog({
        title: 'Eksporter mal',
        defaultPath: filename,
        filters: [
          { name: 'Fattern-mal', extensions: ['fattern-template'] },
          { name: 'Alle filer', extensions: ['*'] },
        ],
      });

      if (result.canceled || !result.filePath) return;

      await api.exportPackage(templateId, result.filePath);
      toast.success('Mal eksportert', `"${templateName}" er eksportert`);
    } catch (error) {
      console.error('Failed to export template', error);
      toast.error('Kunne ikke eksportere mal', error.message);
    }
  };

  const handleDuplicateTemplate = async (templateId) => {
    try {
      const api = typeof window !== 'undefined' ? window.fattern?.template : null;
      if (!api) return;

      const template = templates.find(t => getTemplateId(t) === templateId);
      if (!template) return;

      const newId = `${templateId}_copy_${Date.now()}`;
      const newName = `${getTemplateName(template)} (Kopi)`;
      
      await api.duplicate(templateId, newId, newName);
      toast.success('Mal duplisert', `"${newName}" har blitt opprettet`);
      await loadTemplates();
    } catch (error) {
      console.error('Failed to duplicate template', error);
      toast.error('Kunne ikke duplisere mal', error.message);
    }
  };

  const handleCreateNewTemplate = async () => {
    try {
      const api = typeof window !== 'undefined' ? window.fattern?.template : null;
      if (!api) return;

      // Create a new template by duplicating the default
      const defaultTemplate = templates.find(t => getTemplateId(t) === 'default_invoice') || templates[0];
      if (defaultTemplate) {
        const templateId = getTemplateId(defaultTemplate);
        const newId = `template_${Date.now()}`;
        const newName = 'Ny mal';
        await api.duplicate(templateId, newId, newName);
        toast.success('Ny mal opprettet', 'Du kan nå redigere den');
        await loadTemplates();
        onOpenTemplateEditor?.(newId);
      } else {
        // Fallback: just open the editor
        onOpenTemplateEditor?.('default_invoice');
      }
    } catch (error) {
      console.error('Failed to create new template', error);
      toast.error('Kunne ikke opprette ny mal', error.message);
    }
  };

  // Filter templates based on active filter
  const filteredTemplates = useMemo(() => {
    if (activeFilter === 'all') {
      return templates;
    } else if (activeFilter === 'builtin') {
      return templates.filter(t => isTemplateBuiltIn(getTemplateId(t)));
    } else if (activeFilter === 'premium') {
      return templates.filter(t => isTemplatePremium(t));
    } else if (activeFilter === 'custom') {
      return templates.filter(t => isTemplateCustom(getTemplateId(t)));
    }
    return templates;
  }, [templates, activeFilter]);

  const premiumTemplates = templates.filter(t => isTemplatePremium(t));
  const hasPremiumTemplates = premiumTemplates.length > 0;

  return (
    <div className="flex gap-6">
      <TemplateFilterSidebar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      
      <div className="flex-1 space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--f-text-body)' }}>Fakturamaler</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--f-text-subtle)' }}>Administrer og rediger faktura maler</p>
      </div>

      {loadingTemplates ? (
        <div className="py-8 text-center text-sm" style={{ color: 'var(--f-text-subtle)' }}>Laster maler...</div>
      ) : (
        <>
          {filteredTemplates.length === 0 ? (
            <div className="rounded-lg p-6 text-center" style={{ border: '1px solid var(--f-border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-sm" style={{ color: 'var(--f-text-soft)' }}>
                {templates.length === 0
                  ? 'Ingen maler funnet. Standard mal vil bli opprettet automatisk.'
                  : `Ingen maler funnet i kategorien "${activeFilter === 'all' ? 'Alle' : activeFilter === 'builtin' ? 'Innebygd' : activeFilter === 'premium' ? 'Premium' : 'Egendefinert'}"`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filteredTemplates.map((template) => {
                const templateId = getTemplateId(template);
                const isDefault = isTemplateDefault(templateId, defaultTemplateId);
                
                return (
                  <TemplateCard
                    key={templateId}
                    template={template}
                    isDefault={isDefault}
                    isSupporter={isSupporter}
                    onSetDefault={() => onSetDefaultTemplate?.(templateId)}
                    onEdit={() => onOpenTemplateEditor?.(templateId)}
                    onExport={() => handleExportTemplate(templateId)}
                    onDuplicate={() => handleDuplicateTemplate(templateId)}
                    onDelete={() => onDeleteTemplate?.(templateId)}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

      {!hasPremiumTemplates && isSupporter && (
        <div className="rounded-lg p-4" style={{ border: '1px solid var(--f-border-green)', background: 'var(--f-green-bg)' }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--f-green-text)' }}>Premium maler</h4>
              <p className="text-xs mb-3" style={{ color: 'var(--f-green-text-dim)' }}>
                Opprett profesjonelle premium maler med avansert design og typografi.
              </p>
            </div>
            <button
              onClick={handleCreatePremiumTemplates}
              className="f-btn-primary rounded-lg px-4 py-2 text-xs font-semibold"
            >
              Opprett premium maler
            </button>
          </div>
        </div>
      )}

      {hasPremiumTemplates && !isSupporter && (
        <div className="rounded-lg p-4" style={{ border: '1px solid rgba(217,119,6,0.3)', background: 'rgba(217,119,6,0.08)' }}>
          <div className="flex items-start gap-3">
            <IconLock className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
            <div className="flex-1">
              <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--f-text-body)' }}>Premium maler tilgjengelig</h4>
              <p className="text-xs" style={{ color: 'var(--f-text-soft)' }}>
                For å bruke premiummaler trenger du Supporter-pakken. Disse malene har profesjonelt design og avansert typografi.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="pt-4" style={{ borderTop: '1px solid var(--f-border-faint)' }}>
        <p className="text-xs mb-3" style={{ color: 'var(--f-text-subtle)' }}>
          Standard mal brukes automatisk når du genererer PDF-er. Du kan endre standard mal når som helst.
        </p>
        <div className="flex gap-2">
          {onImportTemplate && (
            <button
              onClick={onImportTemplate}
              className="f-btn-ghost rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2"
            >
              <IconPackage className="h-4 w-4" />
              Importer mal
            </button>
          )}
          {onOpenTemplateEditor && (
            <button
              onClick={handleCreateNewTemplate}
              className="f-btn-primary rounded-lg px-4 py-2 text-sm font-medium"
            >
              Opprett ny mal
            </button>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
