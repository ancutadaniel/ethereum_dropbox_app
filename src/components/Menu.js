import { useState } from 'react';
import { Menu, Icon } from 'semantic-ui-react';

import './Menu.css';

const MainMenu = ({ account }) => {
  const [activeItem, setActiveItem] = useState('todoList');

  const handleItemClick = (e, { name }) => setActiveItem(name);

  return (
    <Menu id='main_menu'>
      <Menu.Item
        name='IPFS Dropbox'
        active={activeItem === 'todoList'}
        onClick={handleItemClick}
      />
      <p className='account'>
        <Icon name='user' />
        {account}
      </p>
    </Menu>
  );
};

export default MainMenu;
