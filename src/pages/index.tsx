import { Gentk, Project, User } from "@prisma/client";
import {
  Flex,
  Heading,
  Button,
  Link,
  Image,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { NextPage } from "next";
import Head from "next/head";
import { formatDistanceToNow } from "date-fns";
import { Fragment } from "react";
import { useSWRInfinite } from "swr";

type GentkType = Gentk & {
  project: Project;
  minter: User;
  metadata: {
    name: string;
    thumbnailUri: string;
  };
};

const Gentk: React.FC<{
  gentk: GentkType;
}> = ({ gentk }) => (
  <Tr>
    <Td>{gentk.minter.alias || gentk.minter.address}</Td>
    <Td>
      <Link
        color="blue.400"
        href={`https://fxhash.xyz/generative/${gentk.project.issuerId}`}
      >
        {gentk.project.issuerId}
      </Link>
    </Td>
    <Td>
      <Image
        boxSize="100px"
        objectFit="cover"
        src={`https://ipfs.io/ipfs/${
          gentk.metadata.thumbnailUri.split("ipfs://")[1]
        }`}
        alt={gentk.metadata.name}
      />
    </Td>
    <Td>
      {formatDistanceToNow(new Date(gentk.timestamp), { addSuffix: true })}
    </Td>
  </Tr>
);

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const getKey = (pageIndex, previousPageData) => {
  if (previousPageData && !previousPageData.length) return null;
  return `/api/fxindex?cursor=${pageIndex * 20}`;
};

const GentkList: React.FC = () => {
  const { data, error, size, setSize } = useSWRInfinite(getKey, fetcher);

  const isLoading = !data && !error;
  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < 20);

  if (error != null) return <div>Error loading Gentks...</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <Flex direction="column" mb={16} alignItems="center">
      <TableContainer mb={8}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>user</Th>
              <Th>project</Th>
              <Th>preview</Th>
              <Th>time</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((page, i) => (
              <Fragment key={i}>
                {page.map((gentk) => (
                  <Gentk key={gentk.id} gentk={gentk} />
                ))}
              </Fragment>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      {!isReachingEnd && (
        <Button onClick={() => setSize(size + 1)} isLoading={isLoadingMore}>
          Load more
        </Button>
      )}
    </Flex>
  );
};

const Home: NextPage = () => {
  return (
    <Flex direction="column" justifyContent="center" alignItems="center">
      <Head>
        <title>fxindex</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Heading p={16}>fxindex gentks</Heading>

      <Flex direction="column" justify="center" align="center" minWidth={500}>
        <GentkList />
      </Flex>
    </Flex>
  );
};

export default Home;
