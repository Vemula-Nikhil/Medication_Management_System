import {useState} from 'react'
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie'

import './index.css'

const Login = () => {
    const [username, setUsername] = useState()
    const [password, setPassword] = useState()
    const [role, setRole] = useState('patient')
    const [errMsg, setErrMsg] = useState({showSubmitErr: false, errorMsg: ''})

    const navigate = useNavigate()

    const onChangeUsername = event => {
        setUsername(event.target.value)
    }

    const onChangePassword = event => {
        setPassword(event.target.value)
    }

    const onChangeUserRole = event => {
        setRole(event.target.value)
    }

    const onSubmitSuccess = token => {
        Cookies.set('jwt_token', token)
        navigate('/')
        if(role === 'patient'){
            navigate('/patient_dashboard')
        }else{
            navigate('/caretaker_dashboard')
        }
        
    }

    const onSubmitFailure = errMsg => {
        console.log('failure')
        setErrMsg({
            showSubmitErr: true,
            errorMsg: errMsg
        })
    }

    const onSubmitForm = async event => {
        event.preventDefault()
        const userDetails = {username, password, role}
        console.log(username || 'hi')
        console.log(password || 'pa')
        console.log(role || 'oo')
        const url = "https://medication-management-system-7.onrender.com/signin"
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
            onSubmitSuccess(data.token)
        } else {
            onSubmitFailure(data.error)
        }
    }

    return(
        <div className="login-container">
            <form onSubmit={onSubmitForm} className="login-form" >
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
                <button type="submit" className='login-btn'>Login</button>
                <Link to="/signup">
                    <button type="button" className='signup-btn'>Signup</button>
                </Link>
                {errMsg.showSubmitErr && <p className='err-msg'>*{errMsg.errorMsg}</p>}
            </form>
        </div>
        
    )
}

export default Login