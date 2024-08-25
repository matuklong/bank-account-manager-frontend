import { Flex, Text } from '@chakra-ui/react';

// import CTASection from '~/lib/components/samples/CTASection';
// import SomeImage from '~/lib/components/samples/SomeImage';
// import SomeText from '~/lib/components/samples/SomeText';

const Dashboard = () => {
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
      <Text>Dashboard</Text>
    </Flex>
  );
};

export default Dashboard;
