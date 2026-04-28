import { Card, CardContent, Typography } from '@mui/material';

interface SummaryCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  color?: string;
}

export default function SummaryCard({ title, value, icon, color = 'primary.main' }: SummaryCardProps) {
  return (
    <Card sx={{ minWidth: 200 }}>
      <CardContent>
        {icon}
        <Typography color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" sx={{ color }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}