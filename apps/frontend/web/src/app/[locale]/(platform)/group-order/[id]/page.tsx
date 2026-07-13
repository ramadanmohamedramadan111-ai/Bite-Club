import GroupOrderPageView from '@/components/groups/GroupOrderPageView';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return <GroupOrderPageView sessionId={id} />;
}
