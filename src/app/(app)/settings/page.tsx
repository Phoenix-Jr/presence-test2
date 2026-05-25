import { Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure your Presense workspace
        </p>
      </div>
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          <Settings className="h-8 w-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Settings coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}
