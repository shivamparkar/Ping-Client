import React, { useEffect, useState } from 'react';
import './addUser.css';
import useChats from '../../../../hooks/useChats';
import useChatStore from '../../../../stores/chatStore';

const AddUser = () => {
  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  const { setSelectedChat, users } = useChatStore();
  const { createChat, fetchUsers } = useChats();
  const [searchTerm, setSearchTerm] = useState('');




  useEffect(() => {
    fetchUsers(); 
  }, []);

  const handleAddUser = async (user) => {

    try {
      const newChat = await createChat(loggedInUser._id, user._id);
      setSelectedChat(newChat); 
      fetchUsers();
    } catch (err) {
      console.error("Chat creation failed:", err);
    }
  };

  const filteredUsers = searchTerm
    ? users.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];


  return (
    <div className='addUser'>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder='Search username...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {filteredUsers.map((user) => (
        <div className="user" key={user._id}>
          <div className="detail">
            <img src="./avatar.png" alt="" />
            <span>{user.username}</span>
          </div>
          <button onClick={() => handleAddUser(user)}>Add User</button>
        </div>
      ))}
    </div>
  );
};

export default AddUser;
