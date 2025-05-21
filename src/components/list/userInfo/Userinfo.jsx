import React from 'react'
import './userinfo.css'


const Userinfo = () => {

  const loggedInUser = JSON.parse(localStorage.getItem('user'));

  const API_BASE_URL = import.meta.env.VITE_SOCKET_URL;

  return (
    <div className='userInfo'>
      <div className="user">
        <img src={
          loggedInUser?.img ? `${API_BASE_URL}/uploads/${loggedInUser.img}` : "/default-avatar.png"
        } alt="" />
        <h2>{loggedInUser.username}</h2>
      </div>
      <div className="icons">
        <img src="./more.png" alt="" />
        <img src="./video.png" alt="" />
        <img src="./edit.png" alt="" />
      </div>
    </div>
  )
}

export default Userinfo