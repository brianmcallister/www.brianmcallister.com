import React from 'react';

import { Logo } from '../components/Logo';
import { Group } from '../components/Group';
import { CONTENT } from '../lib/content';

const IndexPage = (): React.ReactNode => {
  return (
    <>
      <Logo />

      <div className="content">
        {CONTENT.map((block) => (
          <Group key={block.title} content={block} />
        ))}
      </div>
    </>
  );
};

export default IndexPage;
