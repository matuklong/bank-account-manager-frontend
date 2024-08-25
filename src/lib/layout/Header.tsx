'use client';

import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import {
  Box,
  Flex,
  HStack,
  Icon,
  IconButton,
  Button,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { FaUser } from 'react-icons/fa';
import { FaMoneyBillTrendUp } from 'react-icons/fa6';

import ThemeToggle from './ThemeToggle';

interface Props {
  children: React.ReactNode;
  linkUrl: string;
}

interface LinkProps {
  linkUrl: string;
  linkText: string;
}

const Links: LinkProps[] = [
  { linkUrl: 'dashboard', linkText: 'Dashboard' },
  { linkUrl: 'account', linkText: 'Account' },
];

const NavLink = (props: Props) => {
  const { linkUrl, children } = props;

  return (
    <NextLink href={linkUrl} passHref>
      <Link
        px={2}
        py={1}
        rounded="md"
        _hover={{
          textDecoration: 'none',
          bg: useColorModeValue('gray.200', 'gray.700'),
        }}
      >
        {children}
      </Link>
    </NextLink>
  );
};

const Header = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // return (
  //   <Flex as="header" width="full" align="center">
  //     <Box marginLeft="auto">
  //       <ThemeToggle />
  //     </Box>
  //   </Flex>
  // );

  return (
    <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <IconButton
          size="md"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label="Open Menu"
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems="center">
          <Box>
            <Icon as={FaMoneyBillTrendUp} />
          </Box>
          <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
            {Links.map((link) => (
              <NavLink key={link.linkUrl} linkUrl={link.linkUrl}>
                {link.linkText}
              </NavLink>
            ))}
          </HStack>
        </HStack>
        <Flex alignItems="center">
          <Menu>
            <MenuButton
              as={Button}
              rounded="full"
              variant="link"
              cursor="pointer"
              minW={0}
            >
              <Icon as={FaUser} />
              {/* <Avatar
                  size={'sm'}
                  src={
                    'https://images.unsplash.com/photo-1493666438817-866a91353ca9?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9'
                  }
                /> */}
            </MenuButton>
            <MenuList>
              <MenuItem as="div">
                <Box mr={4}>Dark/Light Mode</Box>
                <ThemeToggle />
              </MenuItem>
              <MenuItem>Profile</MenuItem>
              <MenuDivider />
              <MenuItem>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as="nav" spacing={4}>
            {Links.map((link) => (
              <NavLink key={link.linkUrl} linkUrl={link.linkUrl}>
                {link.linkText}
              </NavLink>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
};

export default Header;
