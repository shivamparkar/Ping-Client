import React, { useState } from 'react'
import "./login.css"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from '../../services/apiClient';
import useAuth from '../../hooks/useAuth';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const { authenticate, createNewUser } = useAuth();



    const [avatar, setAvatar] = useState({
        file: null,
        url: ""
    })

    const handleAvatar = e => {
        if (e.target.files[0]) {
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }

    }

    const handleLogin = async (e) => {
        debugger;
        e.preventDefault()
        try {
            await authenticate(credentials);
            toast.success("Login successful!");
        } catch (error) {
            toast.error("Invalid credentials");
        }
    }


    const createUser = async (e) => {
        debugger
        e.preventDefault();

        const formData = new FormData();
        formData.append("username", credentials.username);
        formData.append("email", credentials.email);
        formData.append("password", credentials.password);
        if (avatar.file) {
            formData.append("img", avatar.file);
        }

        for (let pair of formData.entries()) {
            console.log(pair[0], ":", pair[1]);
        }


        try {
            await createNewUser(formData);
            toast.success("User registered successfully!");
        } catch (error) {
            toast.error("Registration failed");
        }
    };


    const handleInputChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className='login'>
            <div className="item">
                <h2>Welcome back</h2>
                <form onSubmit={handleLogin}>
                    <input type="text" placeholder='Email' name="email" onChange={handleInputChange} />
                    <input type="password" placeholder='password' name="password" onChange={handleInputChange} />
                    <button>Sign In</button>
                </form>
            </div>
            <div className="separator"></div>
            <div className="item">
                <h2>Create an Account</h2>
                <form onSubmit={createUser}>
                    <label htmlFor='file'>
                        <img src={avatar.url || "./avatar.png"} alt="" />
                        Upload an Image
                    </label>
                    <input type="file" id="file" style={{ display: "none" }} onChange={handleAvatar} />
                    <input type="text" placeholder='UserName' name="username" onChange={handleInputChange} />
                    <input type="text" placeholder='Email' name="email" onChange={handleInputChange} />
                    <input type="password" placeholder='password' name="password" onChange={handleInputChange} />
                    <button>Sign UP</button>
                </form>
            </div>
        </div>
    )
}

export default Login