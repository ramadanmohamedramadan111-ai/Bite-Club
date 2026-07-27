import { RegisterForm } from '@/components/auth/UserRegisterForm';
import { parseSearchParams, ReferrerParams } from '@/utils/validate-search-params';
import InvalidSearchParams from '@/components/errors/InvalidSearchParams';

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ referrer_code?: string }>;
}) {
  const raw = await searchParams;
  const parsed = parseSearchParams(ReferrerParams, raw);
  if (!parsed.success) return <InvalidSearchParams />;
  const { referrer_code = '' } = parsed.data;

  return (
    <>
      <RegisterForm referrer_code={referrer_code} />
    </>
  );
}

