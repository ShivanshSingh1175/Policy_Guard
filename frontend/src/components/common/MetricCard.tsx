import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  loading?: boolean;
}

export default function MetricCard({ title, value, icon, color = 'primary.main', loading }: MetricCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Typography variant="h4" component="div">
                {value}
              </Typography>
            )}
          </Box>
          <Box sx={{ color, fontSize: 40 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
