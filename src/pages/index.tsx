import type { NextPage } from "next";
import Head from "next/head";
import { HomeView, CreateView } from "../views";
import { SelectToken } from '../components/SelectToken';

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Solana Token Creator</title>
        <meta
          name="description"
          content="token Creator"
        />
      </Head>
      <CreateView />
      {/* <SelectToken/> */}
    </div>
  );
};

export default Home;
