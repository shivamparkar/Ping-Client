import React from 'react'
import './details.css';
import useAuth from '../../hooks/useAuth';

const Details = () => {

  const { logoutUser } = useAuth();
  const loggedInUser = JSON.parse(localStorage.getItem('user'));

  const API_BASE_URL = import.meta.env.VITE_SOCKET_URL;

  const handleLogout = () => {
    logoutUser();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <div className='detail'>
      <div className="user">
        <img src={
          loggedInUser?.img ? `${API_BASE_URL}/uploads/${loggedInUser.img}` : "/default-avatar.png"
        } alt="" />
        <h2>{loggedInUser.username}</h2>

      </div>

      <div className="info">
        {/* <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Privacy & help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Settings</span>
            <img src="./arrowDown.png" alt="" />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https:
                <span>sad boy.png</span>
              </div>
              <img src="./download.png" alt="" className='icon'/>
            </div>
          </div>

          <div className="photos  ">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https:
                <span>sad boy.png</span>
              </div>
              <img src="./download.png" alt="" className='icon'/>
            </div>
          </div>

          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https:
                <span>sad boy.png</span>
              </div>
              <img src="./download.png" alt="" className='icon'/>
            </div>
          </div>

        </div>


        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowDown.png" alt="" />
          </div>
        </div> */}


        {/* <button>Block User</button> */}
        <button className='logout' onClick={handleLogout}>Logout</button>

      </div>
    </div>
  )
}

export default Details