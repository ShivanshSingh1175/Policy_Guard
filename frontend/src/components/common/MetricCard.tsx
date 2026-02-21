import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import type { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  loading?: boolean;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'flat';
  };
  subtitle?: string;
}

export default function MetricCard({ 
  title, 
  value, 
  icon, 
  color = '#2872A1', 
  loading,
  trend,
  subtitle 
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    const iconProps = {
      fontSize: 'small' as const,
      sx: { 
        color: trend.direction === 'up' ? '#4CAF50' : trend.direction === 'down' ? '#F44336' : '#9E9E9E'
      }
    };
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp {...iconProps} />;
      case 'down':
        return <TrendingDown {...iconProps} />;
      case 'flat':
        return <TrendingFlat {...iconProps} />;
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${color} 0%, ${color}88 100%)`,
        },
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontSize: '0.75rem',
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: `${color}15`,
              fontSize: 28,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: `${color}25`,
                transform: 'scale(1.1) rotate(5deg)',
              },
            }}
          >
            {icon}
          </Box>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
            <CircularProgress size={32} sx={{ color: color }} />
          </Box>
        ) : (
          <>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: trend || subtitle ? 1 : 0,
              }}
            >
              {value}
            </Typography>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {getTrendIcon()}
                <Typography
                  variant="body2"
                  sx={{
                    color: trend.direction === 'up' ? '#4CAF50' : trend.direction === 'down' ? '#F44336' : '#9E9E9E',
                    fontWeight: 600,
                  }}
                >
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  vs last period
                </Typography>
              </Box>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

