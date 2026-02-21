import { Box, Typography } from '@mui/material';
import { Warning, Error, Info, CheckCircle } from '@mui/icons-material';

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'small' | 'medium' | 'large';
}

export const RiskBadge = ({ level, score, size = 'medium' }: RiskBadgeProps) => {
  const getConfig = (risk: RiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
        return {
          color: '#D32F2F',
          bgColor: 'rgba(211, 47, 47, 0.1)',
          icon: <Error />,
        };
      case 'HIGH':
        return {
          color: '#F57C00',
          bgColor: 'rgba(245, 124, 0, 0.1)',
          icon: <Warning />,
        };
      case 'MEDIUM':
        return {
          color: '#FFA726',
          bgColor: 'rgba(255, 167, 38, 0.1)',
          icon: <Info />,
        };
      case 'LOW':
        return {
          color: '#66BB6A',
          bgColor: 'rgba(102, 187, 106, 0.1)',
          icon: <CheckCircle />,
        };
    }
  };

  const config = getConfig(level);
  const sizeMap = {
    small: { padding: '4px 8px', fontSize: '0.75rem', iconSize: 16 },
    medium: { padding: '6px 12px', fontSize: '0.875rem', iconSize: 20 },
    large: { padding: '8px 16px', fontSize: '1rem', iconSize: 24 },
  };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        padding: sizeMap[size].padding,
        borderRadius: 2,
        backgroundColor: config.bgColor,
        border: `1px solid ${config.color}`,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: `0 4px 12px ${config.bgColor}`,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          color: config.color,
          '& svg': {
            fontSize: sizeMap[size].iconSize,
          },
        }}
      >
        {config.icon}
      </Box>
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: sizeMap[size].fontSize,
          color: config.color,
          letterSpacing: '0.02em',
        }}
      >
        {level}
      </Typography>
      {score !== undefined && (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: sizeMap[size].fontSize,
            color: config.color,
            opacity: 0.8,
            ml: 0.5,
          }}
        >
          ({score})
        </Typography>
      )}
    </Box>
  );
};
