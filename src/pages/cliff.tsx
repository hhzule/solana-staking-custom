import type { NextPage } from "next";
import Head from "next/head";
import { ElonView } from "../views";

const Basics: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Clifford Inu BURN</title>
        <meta
          name="description"
          content="Clifford Inu BURN"
        />
      </Head>
      <ElonView />
    </div>
  );
};

export default Basics;
