import { Flex } from '@chakra-ui/react';
import Link from 'next/link';

// import CTASection from '~/lib/components/samples/CTASection';
// import SomeImage from '~/lib/components/samples/SomeImage';
// import SomeText from '~/lib/components/samples/SomeText';

const Home = () => {
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      minHeight="70vh"
      gap={4}
      mb={8}
      w="full"
    >
      <h1>Bank Account Manager (Under construction)</h1>
      <h2>
        Creating Account Page. Visit: <Link href="/account">Account</Link>
      </h2>
      {/* <SomeText />
      <SomeImage />
      <CTASection /> */}
    </Flex>
  );
};

export default Home;
