type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function Page({ params }: PageProps) {
  const { token } = await params;

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="text-2xl font-bold">Join group</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Group invitation page coming soon. Invite token: {token}
      </p>
    </div>
  );
}
