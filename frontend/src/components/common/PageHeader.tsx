import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  action?: ReactNode;
}

export const PageHeader = ({ title, subtitle, breadcrumbs, action }: PageHeaderProps) => {
  return (
    <Box
      sx={{
        mb: 4,
        animation: 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(-10px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 2 }}
        >
          {breadcrumbs.map((crumb, index) => (
            <Link
              key={index}
              href={crumb.href || '#'}
              underline="hover"
              color="inherit"
              sx={{
                fontSize: '0.875rem',
                opacity: index === breadcrumbs.length - 1 ? 1 : 0.7,
                fontWeight: index === breadcrumbs.length - 1 ? 600 : 400,
              }}
            >
              {crumb.label}
            </Link>
          ))}
        </Breadcrumbs>
      )}
      
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #2872A1 0%, #3A8BC2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: subtitle ? 1 : 0,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 600 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {action && (
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexShrink: 0,
            }}
          >
            {action}
          </Box>
        )}
      </Box>
    </Box>
  );
};
