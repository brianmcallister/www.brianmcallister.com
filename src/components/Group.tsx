import React from 'react';

import {
  ContentBlock,
  isWithItems,
  ContentBlockWithItems,
  ContentBlockWithComponent,
} from '../lib/content';

interface Props {
  content: ContentBlock;
}

const renderList = (items: ContentBlockWithItems['items']) => {
  return (
    <>
      {items.map((item, index) => (
        <React.Fragment key={item.href}>
          <a href={item.href}>{item.title}</a>
          <span>{index < items.length - 1 ? ', ' : null}</span>
        </React.Fragment>
      ))}
    </>
  );
};

const renderComponent = (Component: ContentBlockWithComponent['component']) => (
  <Component />
);

export const Group = ({ content }: Props): JSX.Element => {
  const { title } = content;
  const renderedContent = isWithItems(content)
    ? renderList(content.items)
    : renderComponent(content.component);

  return (
    <div className="group">
      <strong>{title}</strong>
      &nbsp;
      {renderedContent}
    </div>
  );
};
