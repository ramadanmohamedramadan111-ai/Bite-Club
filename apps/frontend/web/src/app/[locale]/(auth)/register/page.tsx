import { RegisterForm } from '@/components/auth/UserRegisterForm';

export default async function page({
  searchParams,
}: {
  searchParams: { referrer_code?: string };
}) {
  const referrer_code = searchParams.referrer_code || '';

  return (
    <>
      <RegisterForm referrer_code={referrer_code} />
    </>
  );
}

