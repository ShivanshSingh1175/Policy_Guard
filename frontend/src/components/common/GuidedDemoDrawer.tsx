import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  Login as LoginIcon,
  CloudUpload as UploadIcon,
  AutoFixHigh as ExtractIcon,
  PlayArrow as ScanIcon,
  Gavel as ViolationIcon,
  AccountBalance as AccountIcon,
  Download as ExportIcon,
  CheckCircle as CompleteIcon,
} from '@mui/icons-material';

interface GuidedDemoDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface DemoStep {
  id: number;
  title: string;
  description: string;
  route: string;
  icon: React.ReactNode;
  completed?: boolean;
}

export function GuidedDemoDrawer({ open, onClose }: GuidedDemoDrawerProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps: DemoStep[] = [
    {
      id: 1,
      title: 'Login / Switch Company',
      description: 'Start with demo credentials: demo@amlbank.com',
      route: '/login',
      icon: <LoginIcon />,
    },
    {
      id: 2,
      title: 'Upload AML Policy PDF',
      description: 'Upload a compliance policy document to extract rules',
      route: '/app/policies',
      icon: <UploadIcon />,
    },
    {
      id: 3,
      title: 'Extract Rules with Gemini',
      description: 'AI transforms policy text into executable MongoDB rules',
      route: '/app/policies',
      icon: <ExtractIcon />,
    },
    {
      id: 4,
      title: 'Run Compliance Scan',
      description: 'Execute rules against your transaction data',
      route: '/app/scans',
      icon: <ScanIcon />,
    },
    {
      id: 5,
      title: 'Review Violations & Create Case',
      description: 'Investigate findings and link violations into cases',
      route: '/app/violations',
      icon: <ViolationIcon />,
    },
    {
      id: 6,
      title: 'Check Account Risk Scores',
      description: 'View risk profiles and violation history',
      route: '/app/accounts',
      icon: <AccountIcon />,
    },
    {
      id: 7,
      title: 'Export Audit Pack',
      description: 'Generate compliance evidence for regulators',
      route: '/app/scans',
      icon: <ExportIcon />,
    },
  ];

  const handleJumpTo = (route: string, stepId: number) => {
    navigate(route);
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    onClose();
  };

  const progress = Math.round((completedSteps.length / steps.length) * 100);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 420,
          bgcolor: theme.palette.background.default,
          backgroundImage: 'none',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Guided Demo
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Follow these steps to experience PolicyGuard's full compliance workflow
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {completedSteps.length} / {steps.length}
            </Typography>
          </Box>
          <Box
            sx={{
              height: 8,
              bgcolor: alpha(theme.palette.primary.main, 0.2),
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${progress}%`,
                bgcolor: theme.palette.primary.main,
                transition: 'width 0.3s ease',
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <List sx={{ p: 0 }}>
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            return (
              <Box key={step.id}>
                <ListItem
                  disablePadding
                  sx={{
                    mb: 1,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    bgcolor: isCompleted
                      ? alpha(theme.palette.success.main, 0.1)
                      : alpha(theme.palette.background.paper, 0.5),
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <ListItemButton onClick={() => handleJumpTo(step.route, step.id)}>
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: isCompleted ? theme.palette.success.main : theme.palette.text.secondary,
                      }}
                    >
                      {isCompleted ? <CompleteIcon /> : step.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={step.id}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              bgcolor: isCompleted
                                ? theme.palette.success.main
                                : alpha(theme.palette.primary.main, 0.2),
                            }}
                          />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {step.title}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {step.description}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              </Box>
            );
          })}
        </List>

        <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">
            💡 Tip: Click any step to jump directly to that page. Your progress is tracked automatically.
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}
