import { RegisterForm } from '@/components/auth/UserRegisterForm';

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ referrer_code?: string }>;
}) {
  const searchParamsValue = await searchParams;
  const referrer_code = searchParamsValue.referrer_code || '';

  console.log('referrer_code:', referrer_code);

  return (
    <>
      <RegisterForm referrer_code={referrer_code} />
    </>
  );
}

