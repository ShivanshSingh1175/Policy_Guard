import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';
import { 
  CheckCircle, 
  HourglassEmpty, 
  Cancel, 
  PlayCircle,
  Error as ErrorIcon 
} from '@mui/icons-material';

type Status = 'COMPLETED' | 'RUNNING' | 'PENDING' | 'FAILED' | 'ACTIVE' | 'INACTIVE' | 'ERROR' | 
              'OPEN' | 'IN_REVIEW' | 'CLOSED' | 'CONFIRMED' | 'DISMISSED' | 'FALSE_POSITIVE';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: Status;
}

export const StatusChip = ({ status, ...props }: StatusChipProps) => {
  const getConfig = (stat: Status) => {
    switch (stat) {
      case 'COMPLETED':
      case 'ACTIVE':
      case 'CLOSED':
      case 'CONFIRMED':
        return { color: 'success' as const, icon: <CheckCircle /> };
      case 'RUNNING':
      case 'IN_REVIEW':
        return { color: 'info' as const, icon: <PlayCircle /> };
      case 'PENDING':
      case 'OPEN':
        return { color: 'warning' as const, icon: <HourglassEmpty /> };
      case 'FAILED':
      case 'ERROR':
      case 'DISMISSED':
      case 'FALSE_POSITIVE':
        return { color: 'error' as const, icon: <ErrorIcon /> };
      case 'INACTIVE':
        return { color: 'default' as const, icon: <Cancel /> };
      default:
        return { color: 'default' as const, icon: undefined };
    }
  };

  const config = getConfig(status);

  return (
    <Chip
      label={status}
      color={config.color}
      icon={config.icon}
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
