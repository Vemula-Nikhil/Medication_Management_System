import {useState} from 'react'
import { Link } from 'react-router-dom';

import './index.css'

const Signup = () => {
    const [username, setUsername] = useState()
    const [password, setPassword] = useState()
    const [role, setRole] = useState('patient')
    const [errMsg, setErrMsg] = useState({showSubmitErr: false, errorMsg: ''})
    const [isSignup, setIsSignup] = useState(false)

    const onChangeUsername = event => {
        setUsername(event.target.value)
    }

    const onChangePassword = event => {
        setPassword(event.target.value)
    }

    const onChangeUserRole = event => {
        setRole(event.target.value)
    }

    const onSubmitSuccess = () => {
        setIsSignup(true)
  
    }

    const onSubmitFailure = errMsg => {
        setErrMsg({
            showSubmitErr: true,
            errorMsg: errMsg
        })
    }

    const onSubmitForm = async event => {
        event.preventDefault()
        const userDetails = {username, password, role}
        const url = "https://medication-management-system-7.onrender.com/signup"
        const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userDetails),
        }
        const response = await fetch(url, options)
        const data = await response.json()
        console.log(response)
        if (response.ok === true) {
            onSubmitSuccess()
        } else {
            onSubmitFailure(data.error)
        }
    }

    return(
        
        <div className="login-container">
            {isSignup ? 
            <div className='signup-success-container'>
                <p className="success-msg">User Registered Seccessfully</p>
                <Link to="/signin" className='link-signin'>
                    <button type='button' className='return-login'>Return to Login</button>
                </Link>
            </div>:
            <form onSubmit={onSubmitForm} className="signup-form" >
                <h1 className="medicare-text">MediCare Companion</h1>
                <div className='input-container'>
                    <label className="input-label" htmlFor="username">USERNAME</label>
                    <input
                        type="text"
                        id="username"
                        className="input-filed"
                        placeholder='Enter Username'
                        value={username}
                        onChange={onChangeUsername}
                    />
                </div>
                <div className='input-container'>
                    <label className="input-label" htmlFor="password">PASSWORD</label>
                    <input
                        type="password"
                        id="password"
                        className="input-filed"
                        placeholder="Enter Password"
                        value={password}
                        onChange={onChangePassword}
                    />
                </div>

                <div className='input-container'>
                    <label htmlFor="role" className='role-label'>ROLE</label>
                    <select id="role" className='dropdown' value={role} onChange={onChangeUserRole}>
                        <option value="patient">Patient</option>
                        <option value="caretaker">Caretaker</option>
                    </select>
                </div>
                <button type="submit" className='login-btn'>Signup</button>
                {errMsg.showSubmitErr && <p className='err-msg'>*{errMsg.errorMsg}</p>}
            </form>
            }
        </div>
        
    )
}

export default Signup