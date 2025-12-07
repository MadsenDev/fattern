import {
  FiCalendar,
  FiHome,
  FiLayers,
  FiSettings,
  FiUsers
} from 'react-icons/fi';
import { MdOutlineReceiptLong } from 'react-icons/md';
import { TbReceipt } from 'react-icons/tb';

export const navItems = [
  { label: 'Oversikt', icon: <FiHome className="h-5 w-5" /> },
  { label: 'Fakturaer', icon: <MdOutlineReceiptLong className="h-5 w-5" /> },
  { label: 'Utgifter', icon: <TbReceipt className="h-5 w-5" /> },
  { label: 'Kunder', icon: <FiUsers className="h-5 w-5" /> },
  { label: 'Produkter', icon: <FiLayers className="h-5 w-5" /> },
  { label: 'Budsjettår', icon: <FiCalendar className="h-5 w-5" /> },
  { label: 'Innstillinger', icon: <FiSettings className="h-5 w-5" /> }
];

export const workflowShortcuts = [
  { label: 'Registrer betaling', helper: '⌘ P' },
  { label: 'Last opp kvittering', helper: '⌘ U' },
  { label: 'Åpne kommando', helper: '⌘ K' }
];

export const statusBadge = {
  paid: 'badge-success',
  sent: 'badge-muted',
  draft: 'badge-ghost',
  overdue: 'badge-warn'
};

export const statusLabel = {
  paid: 'Betalt',
  sent: 'Sendt',
  draft: 'Utkast',
  overdue: 'Forfalt'
};

