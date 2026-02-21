import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';
import { severityColors } from '../../contexts/ThemeContext';

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface SeverityChipProps extends Omit<ChipProps, 'color'> {
  severity: Severity;
}

export const SeverityChip = ({ severity, ...props }: SeverityChipProps) => {
  const getColor = (sev: Severity) => {
    switch (sev) {
      case 'CRITICAL':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      label={severity}
      color={getColor(severity) as any}
      size="small"
      sx={{
        fontWeight: 600,
        fontSize: '0.75rem',
        height: 24,
        ...props.sx,
      }}
      {...props}
    />
  );
};
