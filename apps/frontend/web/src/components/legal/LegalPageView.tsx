import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTranslations } from 'next-intl/server';

type LegalPageViewProps = {
  namespace: 'terms' | 'privacy';
};

export default async function LegalPageView({ namespace }: LegalPageViewProps) {
  const t = await getTranslations(namespace);

  const sections = t.raw('sections') as Array<{
    title: string;
    body: string[];
  }>;

  return (
    <div className="container mx-auto  space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {t('title')}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{t('subtitle')}</p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3.5 py-1.5 text-xs text-muted-foreground">
          {t('lastUpdated')}
        </p>
      </div>

      <div className="space-y-5">
        {sections.map((section, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
              <CardTitle className="text-base font-bold text-primary">
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {section.body.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed text-muted-foreground/90">
                  {paragraph}
                </p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

