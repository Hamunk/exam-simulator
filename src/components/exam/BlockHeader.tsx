import { Card } from "@/components/ui/card";

interface BlockHeaderProps {
  title: string;
  backgroundInfo: string;
}

export function BlockHeader({ title, backgroundInfo }: BlockHeaderProps) {
  return (
    <Card className="p-6 bg-primary/5 border-primary/20 shadow-card">
      <h2 className="text-2xl font-bold text-primary mb-3">{title}</h2>
      <p className="text-foreground leading-relaxed">{backgroundInfo}</p>
    </Card>
  );
}
